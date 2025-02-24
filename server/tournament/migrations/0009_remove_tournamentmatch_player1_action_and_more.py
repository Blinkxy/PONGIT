

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tournament', '0008_tournamentmatch_player1_action_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='tournamentmatch',
            name='player1_action',
        ),
        migrations.RemoveField(
            model_name='tournamentmatch',
            name='player2_action',
        ),
    ]
