from django import forms
from .models import Task, Tag
from django.utils import timezone # django.utils.timezone をインポート

class TaskForm(forms.ModelForm):
    class Meta:
        model = Task
        fields = ['title', 'description', 'due_date', 'end_date', 'tags']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'rows': 3}),
            'due_date': forms.DateTimeInput(attrs={'type': 'datetime-local'}, format='%Y-%m-%dT%H:%M'),
            'end_date': forms.DateTimeInput(attrs={'type': 'datetime-local'}, format='%Y-%m-%dT%H:%M'),
            'tags': forms.CheckboxSelectMultiple,
        }
        labels = {
            'title': 'タイトル',
            'description': '内容',
            'due_date': '開始日時',
            'end_date': '終了日時',
            'tags': 'タグ',
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk: # 既存タスクの編集の場合
            if self.instance.due_date:
                # データベースの日時 (UTC想定) をローカルタイムゾーンに変換
                local_due_date = timezone.localtime(self.instance.due_date)
                self.initial['due_date'] = local_due_date.strftime('%Y-%m-%dT%H:%M')
            else:
                self.initial['due_date'] = '' # 明示的に空文字を設定

            if self.instance.end_date:
                # データベースの日時 (UTC想定) をローカルタイムゾーンに変換
                local_end_date = timezone.localtime(self.instance.end_date)
                self.initial['end_date'] = local_end_date.strftime('%Y-%m-%dT%H:%M')
            else:
                self.initial['end_date'] = '' # 明示的に空文字を設定
        else: # 新規タスク追加の場合
            self.initial['due_date'] = ''
            self.initial['end_date'] = ''


    def clean(self):
        cleaned_data = super().clean()
        start_date = cleaned_data.get('due_date')
        end_date = cleaned_data.get('end_date')

        if start_date and end_date :
            if start_date > end_date:
                raise forms.ValidationError("終了日時は開始日時より後の日時を設定してください。")
        return cleaned_data