"""
URL configuration for todo project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from todo_app.views import task_list, add_task,toggle_task, deleted_task_list, delete_task, edit_task, restore_task, delete_all_tasks, bulk_delete_tasks

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', task_list, name='task_list'),
    path('add/', add_task, name='add_task'),
    path('toggle/<int:task_id>/', toggle_task, name='toggle_task'),
    path('delete/<int:task_id>/', delete_task, name='delete_task'),
    path('deleted/', deleted_task_list, name='deleted_task_list'),
    path('tag/<str:tag_name>/', task_list, name='task_list_by_tag'),
    path('edit/<int:task_id>/', edit_task, name='edit_task'),
    path('restore/<int:task_id>/', restore_task, name='restore_task'),
    path('delete_all/', delete_all_tasks, name='delete_all_tasks'),
    path('bulk_delete/', bulk_delete_tasks, name='bulk_delete_tasks'),
]
