# Generated by Django 4.2.16 on 2025-01-03 03:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("server", "0009_userprofile_current_session_token_and_more"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="userprofile",
            name="current_session_token",
        ),
        migrations.RemoveField(
            model_name="userprofile",
            name="session_expiry",
        ),
        migrations.AddField(
            model_name="userprofile",
            name="ban_login",
            field=models.BooleanField(default=False),
        ),
    ]
