# Generated by Django 4.2.16 on 2025-01-11 15:21

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0005_alter_history_date_game'),
    ]

    operations = [
        migrations.AlterField(
            model_name='history',
            name='date_game',
            field=models.DateTimeField(default=datetime.datetime.now),
        ),
    ]
