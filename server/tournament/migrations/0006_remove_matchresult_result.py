# Generated by Django 4.2.16 on 2024-12-20 03:35

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tournament', '0005_merge_20241219_0456'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='matchresult',
            name='result',
        ),
    ]
