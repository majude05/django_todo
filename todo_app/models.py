from django.db import models
from django.utils import timezone

# Create your models here.
class Task(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True,null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_completed = models.BooleanField(default=False)
    due_date = models.DateTimeField(blank=True, null=True)
    end_date = models.DateTimeField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(blank=True, null=True)
    tags = models.ManyToManyField('Tag', blank=True)

    def __str__(self):
        return self.title
    
    def delete(self, *args, **kwargs):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

class Tag(models.Model):
    name = models.CharField(max_length=50,unique=True)
    color = models.CharField(max_length=7,default='#808080')

    def __str__(self):
        return self.name
    
    #背景色に基づいて見やすいテキスト色を設定
    def get_text_color_for_background(self):
        hex_color = self.color.lstrip('#')
        if len(hex_color) == 6:
            try:
                r, g, b = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
                brightness = (r * 299 + g * 587 + b * 114) / 1000
                return '#000000' if brightness < 186 else '#FFFFFF'
            except ValueError:
                return '#000000'
        elif len(hex_color) == 3:
            try:
                r, g, b = tuple(int(hex_color[i:i+1] * 2, 16) for i in (0, 1, 2))
                brightness = (r * 299 + g * 587 + b * 114) / 1000
                return '#000000' if brightness < 186 else '#FFFFFF'
            except ValueError:
                return '#000000'
        else:
            return '#000000'
        

class Holiday(models.Model):
    date = models.DateField(verbose_name="日付", unique=True)
    name = models.CharField(verbose_name="祝日名", max_length=100)
    created_at = models.DateTimeField(verbose_name="作成日時", auto_now_add=True)
    updated_at = models.DateTimeField(verbose_name="更新日時", auto_now=True)

    class Meta:
        verbose_name = "祝日"
        verbose_name_plural = "祝日"
        ordering = ['date']

    def __str__(self):
        return f"{self.date.strftime('%Y-%m-%d')} - {self.name}"
