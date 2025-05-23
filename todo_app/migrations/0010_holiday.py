# Generated by Django 5.2 on 2025-05-20 06:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('todo_app', '0009_delete_holiday'),
    ]

    operations = [
        migrations.CreateModel(
            name='Holiday',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(unique=True, verbose_name='日付')),
                ('name', models.CharField(max_length=100, verbose_name='祝日名')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='作成日時')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='更新日時')),
            ],
            options={
                'verbose_name': '祝日',
                'verbose_name_plural': '祝日',
                'ordering': ['date'],
            },
        ),
    ]
