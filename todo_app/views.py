from django.shortcuts import render, redirect, get_object_or_404
from .models import Task, Tag, Holiday # Holiday モデルをインポート
from .forms import TaskForm
from django.utils import timezone
import json
from django.http import JsonResponse
from django.urls import reverse
from datetime import datetime

# Create your views here.
def task_list(request, tag_name=None):
    incomplete_tasks_query = Task.objects.filter(is_completed=False, is_deleted=False)
    completed_tasks_query = Task.objects.filter(is_completed=True, is_deleted=False)
    
    if tag_name:
        tag = get_object_or_404(Tag, name=tag_name)
        incomplete_tasks_query = incomplete_tasks_query.filter(tags=tag)
        completed_tasks_query = completed_tasks_query.filter(tags=tag)

    incomplete_tasks_list = incomplete_tasks_query.order_by('due_date', '-created_at')
    completed_tasks_list = completed_tasks_query.order_by('-created_at')

    incomplete_count = incomplete_tasks_query.count()
    completed_count = completed_tasks_query.count()



    tags = Tag.objects.all()

    context = {
        'incomplete_tasks': incomplete_tasks_list,
        'completed_tasks': completed_tasks_list,
        'incomplete_tasks_count': incomplete_count,
        'completed_tasks_count': completed_count,
        'tags': tags,
        'current_tag': tag_name,
    }

    return render(request, 'task_list.html', context)

def add_task(request):
    initial_data = {}
    if request.method == 'GET':
        due_date_str = request.GET.get('due_date')
        if due_date_str:
            try:
                dt_object = datetime.strptime(due_date_str, '%Y-%m-%d')
                initial_data['due_date'] = dt_object
            except ValueError:
                pass

    if request.method == 'POST':
        form = TaskForm(request.POST)
        if form.is_valid():
            task = Task(
                title=form.cleaned_data['title'],
                description=form.cleaned_data['description'],
                due_date=form.cleaned_data['due_date'],
                end_date=form.cleaned_data['end_date'],
            )
            task.save()
            tags = form.cleaned_data['tags']
            if tags:
                task.tags.set(tags)
            return redirect('task_list')
    else:
        form = TaskForm(initial=initial_data)
    return render(request, 'add_task.html', {'form': form})

def toggle_task(request, task_id):
    task = get_object_or_404(Task, pk=task_id)
    task.is_completed = not task.is_completed
    task.save()
    return redirect('task_list')

def delete_task(request,task_id):
    task = get_object_or_404(Task, pk=task_id)
    task.delete()
    return redirect('task_list')

def deleted_task_list(request):
    deleted_tasks = Task.objects.filter(is_deleted=True).order_by('-deleted_at')
    return render(request, 'deleted_task_list.html', {
        'deleted_tasks': deleted_tasks
    })

def edit_task(request, task_id):
    task = get_object_or_404(Task, pk=task_id)
    if request.method == 'POST':
        form = TaskForm(request.POST, initial={
            'title': task.title,
            'description': task.description,
            'due_date': task.due_date.strftime('%Y-%m-%dT%H:%M') if task.due_date else None,
            'tags': task.tags.all()
        })
        if form.is_valid():
            task.title = form.cleaned_data['title']
            task.description = form.cleaned_data['description']
            task.due_date = form.cleaned_data['due_date']
            task.end_date = form.cleaned_data['end_date']
            task.tags.set(form.cleaned_data['tags'])
            task.save()
            return redirect('task_list')
    else:
        form = TaskForm(initial={
            'title': task.title,
            'description': task.description,
            'due_date': task.due_date.strftime('%Y-%m-%dT%H:%M') if task.due_date else None,
            'end_date': task.end_date.strftime('%Y-%m-%dT%H:%M') if task.end_date else None,
            'tags': task.tags.all()
        })
    return render(request, 'edit_task.html', {
        'form': form,
        'task': task
    })

def restore_task(request, task_id):
    task = get_object_or_404(Task, pk=task_id, is_deleted=True)
    task.is_deleted = False
    task.deleted_at = None
    task.save()
    return redirect('deleted_task_list')

def delete_all_tasks(request):
    if request.method == 'POST':
        Task.objects.filter(is_deleted=True).delete()
        return redirect('deleted_task_list')
    
def bulk_delete_tasks(request):
    if request.method == 'POST':
        task_ids_json = request.POST.get('task_ids')
        if task_ids_json:
            task_ids = json.loads(task_ids_json)
            Task.objects.filter(id__in=task_ids, is_deleted=True).delete()
    return redirect('deleted_task_list')

def task_events_api(request):
    tasks = Task.objects.filter(is_deleted=False, due_date__isnull=False)
    events = []

    # タスクイベントの処理
    for task in tasks:
        event_color = '#808080'  # デフォルト色
        text_color = '#FFFFFF'   # デフォルトのテキスト色
        if task.tags.exists():
            first_tag = task.tags.first()
            if first_tag and first_tag.color:
                event_color = first_tag.color
                text_color = first_tag.get_text_color_for_background()


        event_data = {
            'id': f"task-{task.id}", # IDが一意になるようにプレフィックスを追加
            'title': task.title,
            'start': task.due_date.isoformat() if task.due_date else None,
            'end': task.end_date.isoformat() if task.end_date else None,
            'backgroundColor': event_color,
            'borderColor': event_color,
            'textColor': text_color,
            'extendedProps': {
                'type': 'task', # イベントタイプを識別できるように追加
                'description': task.description or '',
                'tags': [tag.name for tag in task.tags.all()],
                'edit_url': reverse('edit_task', args=[task.id]),
            }
        }
        events.append(event_data)
    
    # 祝日イベントの処理
    holidays = Holiday.objects.all() # Holidayモデルから全祝日を取得
    for holiday in holidays:
        holiday_event_data = {
            'id': f"holiday-{holiday.id}", # IDが一意になるようにプレフィックスを追加
            'title': holiday.name, # 祝日名
            'start': holiday.date.isoformat(), # YYYY-MM-DD 形式
            'allDay': True,
            'display': 'background', # 背景イベントとして表示
            'classNames': ['fc-day-holiday'], # CSSクラスを適用
            # 必要に応じて、extendedPropsに情報を追加できます
            'extendedProps': {
                'type': 'holiday' # イベントタイプを識別できるように追加
            }
        }
        events.append(holiday_event_data)
                
    return JsonResponse(events, safe=False)