# Generated by Django 4.2.16 on 2024-12-20 06:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tournament', '0007_alter_matchresult_match_loser_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='tournamentmatch',
            name='player1_action',
            field=models.CharField(default='Pending', max_length=20),
        ),
        migrations.AddField(
            model_name='tournamentmatch',
            name='player2_action',
            field=models.CharField(default='Pending', max_length=20),
        ),
    ]
