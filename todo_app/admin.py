from django.contrib import admin
from .models import Task, Tag, Holiday # Holiday をインポート

class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'color')
    search_fields = ('name',)

class HolidayAdmin(admin.ModelAdmin): # HolidayAdmin を追加
    list_display = ('date', 'name', 'is_statutory', 'updated_at')
    list_filter = ('is_statutory', 'date')
    search_fields = ('name',)

admin.site.register(Task)
admin.site.register(Tag, TagAdmin)
admin.site.register(Holiday, HolidayAdmin) # Holiday モデルを登録