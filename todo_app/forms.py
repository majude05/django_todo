from django import forms
from .models import Task, Tag

class TaskForm(forms.Form):
    title = forms.CharField(max_length=100, label='タイトル')
    description = forms.CharField(widget=forms.Textarea, required=False, label='内容')
    due_date = forms.DateTimeField(widget=forms.DateTimeInput(attrs={'type': 'datetime-local'}), required=False, label='締め切り')

    tags = forms.ModelMultipleChoiceField(
        queryset=Tag.objects.all(),
        widget=forms.CheckboxSelectMultiple,
        required=True,
        label='タグ'
    )