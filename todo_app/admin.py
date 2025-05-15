from django.contrib import admin
from .models import Task, Tag

class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'color')
    search_fields = ('name',)

# Register your models here.
admin.site.register(Task)
admin.site.register(Tag, TagAdmin)
