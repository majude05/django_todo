from django.shortcuts import render, redirect, get_object_or_404
from .models import Task, Tag
from .forms import TaskForm
from django.utils import timezone
import json
from django.http import JsonResponse
from django.urls import reverse

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
    if request.method == 'POST':
        form = TaskForm(request.POST)
        if form.is_valid():
            task = Task(
                title=form.cleaned_data['title'],
                description=form.cleaned_data['description'],
                due_date=form.cleaned_data['due_date']
            )
            task.save()
            task.tags.set(form.cleaned_data['tags'])
            return redirect('task_list')
    else:
        form = TaskForm()
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
            task.tags.set(form.cleaned_data['tags'])
            task.save()
            return redirect('task_list')
    else:
        form = TaskForm(initial={
            'title': task.title,
            'description': task.description,
            'due_date': task.due_date.strftime('%Y-%m-%dT%H:%M') if task.due_date else None,
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

    for task in tasks:
        event_color = '#808080'
        if task.tags.exists():
            first_tag = task.tags.first()
            if first_tag and first_tag.color:
                event_color = first_tag.color

        event_data = {
            'id': task.id,
            'title': task.title,
            'start': task.due_date.isoformat() if task.due_date else None,
            #'end': task.end_date.isoformat() if task.end_date else None,
            'backgroundColor': event_color,
            'borderColor': event_color,
            'textColor': '#FFFFFF',
            #'url': reverse('edit_task', args=[task.id]),
            'extendedProps': {
                'description': task.description or '',
                'start_time': task.due_date.strftime('%H:%M') if task.due_date else '',
                #'end_time': '',
                'tags': [tag.name for tag in task.tags.all()]
            }
        }
        if event_data['start']:
                events.append(event_data)
                
    return JsonResponse(events, safe=False)