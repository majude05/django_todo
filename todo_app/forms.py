from django import forms
from .models import Task, Tag

class TaskForm(forms.Form):
    title = forms.CharField(max_length=100, label='タイトル')
    description = forms.CharField(widget=forms.Textarea, required=False, label='内容')
    
    due_date = forms.DateTimeField(
        widget=forms.DateTimeInput(attrs={'type': 'datetime-local'}), 
        required=False, 
        label='開始日時'
        )
    
    end_date = forms.DateTimeField(
        widget=forms.DateTimeInput(attrs={'type': 'datetime-local'}), 
        required=False, 
        label='終了日時'
        )

    tags = forms.ModelMultipleChoiceField(
        queryset=Tag.objects.all(),
        widget=forms.CheckboxSelectMultiple,
        required=True,#タグ付けが不必要ならFalse
        label='タグ'
    )

    def clean(self):
        cleaned_data = super().clean()
        start_date = cleaned_data.get('due_date')
        end_date = cleaned_data.get('end_date')

        if start_date and end_date :
            if start_date > end_date:
                raise forms.ValidationError("終了日時は開始日時より後の日時を設定してください。")

        return cleaned_data