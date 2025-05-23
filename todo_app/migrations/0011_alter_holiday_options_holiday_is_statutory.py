# Generated by Django 5.2 on 2025-05-21 05:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('todo_app', '0010_holiday'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='holiday',
            options={'ordering': ['date'], 'verbose_name': '祝日・記念日', 'verbose_name_plural': '祝日・記念日'},
        ),
        migrations.AddField(
            model_name='holiday',
            name='is_statutory',
            field=models.BooleanField(default=True, verbose_name='法定休日'),
        ),
    ]
