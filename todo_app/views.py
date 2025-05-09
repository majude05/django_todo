from django.shortcuts import render, redirect, get_object_or_404
from .models import Task, Tag
from .forms import TaskForm
from django.utils import timezone

# Create your views here.
def task_list(request, tag_name=None):
    incomplete_tasks = Task.objects.filter(is_completed=False, is_deleted=False)
    completed_tasks = Task.objects.filter(is_completed=True, is_deleted=False)
    if tag_name:
        incomplete_tasks = incomplete_tasks.filter(tags__name=tag_name)
        completed_tasks = completed_tasks.filter(tags__name=tag_name)

    tags = Tag.objects.all()

    return render(request, 'task_list.html', {
        'incomplete_tasks': incomplete_tasks,
        'completed_tasks': completed_tasks,
        'tags': tags,
        'current_tag': tag_name,
    })

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