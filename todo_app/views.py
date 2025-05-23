# todo_app/views.py

from django.shortcuts import render, redirect, get_object_or_404
from .models import Task, Tag, Holiday
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
            tags_data = form.cleaned_data['tags'] # form.cleaned_data から取得
            if tags_data:
                task.tags.set(tags_data)
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
    task.delete() # Taskモデルのカスタムdeleteメソッドが呼ばれる
    return redirect('task_list')

def deleted_task_list(request):
    deleted_tasks = Task.objects.filter(is_deleted=True).order_by('-deleted_at')
    return render(request, 'deleted_task_list.html', {
        'deleted_tasks': deleted_tasks
    })

def edit_task(request, task_id):
    task = get_object_or_404(Task, pk=task_id)
    if request.method == 'POST':
        form = TaskForm(request.POST, instance=task) # instance=task を追加
        if form.is_valid():
            form.save() # ModelFormのsaveメソッドで保存
            return redirect('task_list')
    else:
        form = TaskForm(instance=task) # instance=task を指定して初期値を設定
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
        Task.objects.filter(is_deleted=True).delete() # 物理削除
        return redirect('deleted_task_list')

def bulk_delete_tasks(request):
    if request.method == 'POST':
        task_ids_json = request.POST.get('task_ids')
        if task_ids_json:
            task_ids = json.loads(task_ids_json)
            Task.objects.filter(id__in=task_ids, is_deleted=True).delete() # 物理削除
    return redirect('deleted_task_list')

def task_events_api(request):
    tasks = Task.objects.filter(is_deleted=False, due_date__isnull=False)
    events = []

    # タスクイベントの処理
    for task in tasks:
        event_color = '#808080' # デフォルトグレー
        text_color = '#FFFFFF' # デフォルト白
        if task.tags.exists():
            first_tag = task.tags.first()
            if first_tag and first_tag.color:
                event_color = first_tag.color
                text_color = first_tag.get_text_color_for_background()

        event_data = {
            'id': f"task-{task.id}",
            'title': task.title,
            'start': task.due_date.isoformat() if task.due_date else None,
            'end': task.end_date.isoformat() if task.end_date else None,
            'backgroundColor': event_color,
            'borderColor': event_color, # 枠線も同色に
            'textColor': text_color,
            'classNames': ['fc-task-event'], # タスクイベント共通クラス
            'extendedProps': {
                'type': 'task',
                'description': task.description or '',
                'tags': [tag.name for tag in task.tags.all()],
                'edit_url': reverse('edit_task', args=[task.id]),
                'delete_url': reverse('delete_task', args=[task.id])
            }
        }
        events.append(event_data)

    # 祝日・記念日イベントの処理
    holidays = Holiday.objects.all()
    for holiday in holidays:
        if holiday.is_statutory: # 法定休日の場合
            # --- 1. 法定休日の日付の背景色を変えるための背景イベント ---
            background_event_data = {
                'id': f"holiday-bg-statutory-{holiday.id}",
                'start': holiday.date.isoformat(),
                'allDay': True,
                'display': 'background',
                'backgroundColor': '#ffebee', # 法定休日の初期背景色
                'extendedProps': {
                    'type': 'statutory_holiday_background',
                    'is_statutory': True # JavaScriptで識別用
                }
            }
            events.append(background_event_data)

            # --- 2. 法定休日名を表示するための通常イベント ---
            name_display_event_data = {
                'id': f"holiday-name-statutory-{holiday.id}",
                'title': holiday.name,
                'start': holiday.date.isoformat(),
                'allDay': True,
                'display': 'block',
                'textColor': 'white', # 法定休日の文字色
                'classNames': ['fc-holiday-name-event', 'fc-statutory-holiday-name'],
                'extendedProps': {
                    'type': 'statutory_holiday_name',
                    'is_statutory': True
                }
                # backgroundColor, borderColor はCSSで transparent !important にする
            }
            events.append(name_display_event_data)

        else: # 記念日の場合
            # --- 記念日の場合は、日付マスの背景色を変更するイベントは追加しない ---
            # --- 記念日名を表示するための通常イベントのみ追加 ---
            name_display_event_data = {
                'id': f"holiday-name-memorial-{holiday.id}",
                'title': holiday.name,
                'start': holiday.date.isoformat(),
                'allDay': True,
                'display': 'block',
                'textColor': 'white', # 記念日の文字色
                'classNames': ['fc-holiday-name-event', 'fc-memorial-day-name'],
                'extendedProps': {
                    'type': 'memorial_day_name',
                    'is_statutory': False
                }
                # backgroundColor, borderColor はCSSで transparent !important にする
            }
            events.append(name_display_event_data)

    return JsonResponse(events, safe=False)