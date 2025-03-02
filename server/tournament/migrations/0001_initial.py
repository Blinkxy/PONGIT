# Generated by Django 4.2.16 on 2024-12-05 05:56

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Tournament',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('creation_date', models.DateField(auto_now_add=True)),
                ('owner_identifier', models.CharField(max_length=10)),
                ('tournament_status', models.CharField(choices=[('Draft', 'Draft'), ('Active', 'Active'), ('Completed', 'Completed')], default='Draft', max_length=20)),
                ('tournament_size', models.IntegerField(choices=[(4, '4 Players'), (8, '8 Players'), (16, '16 Players')], default=4)),
                ('players_count', models.IntegerField(default=1)),
                ('rounds_num', models.IntegerField(default=0)),
                ('created_by', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='TournamentRound',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('round_number', models.IntegerField()),
                ('round_status', models.CharField(choices=[('Pending', 'Pending'), ('Active', 'Active'), ('Completed', 'Completed')], default='Pending', max_length=20)),
                ('tournament', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='rounds', to='tournament.tournament')),
            ],
        ),
        migrations.CreateModel(
            name='TournamentPlayer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('player_type', models.BooleanField(default=False)),
                ('joined_date', models.DateField(auto_now_add=True)),
                ('joined_time', models.TimeField(auto_now_add=True)),
                ('player_identifier', models.CharField(max_length=10)),
                ('player', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='tournaments', to=settings.AUTH_USER_MODEL)),
                ('tournament', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='players', to='tournament.tournament')),
            ],
        ),
        migrations.CreateModel(
            name='TournamentMatch',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('match_date', models.DateField(auto_now_add=True)),
                ('match_status', models.CharField(choices=[('Pending', 'Pending'), ('Active', 'Active'), ('Completed', 'Completed')], default='Pending', max_length=20)),
                ('match_round', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='matches', to='tournament.tournamentround')),
                ('player1', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='player1_matches', to='tournament.tournamentplayer')),
                ('player2', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='player2_matches', to='tournament.tournamentplayer')),
            ],
        ),
        migrations.CreateModel(
            name='TournamentInvitation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('invite_status', models.CharField(choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('declined', 'Declined')], default='pending', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('invite_recipient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='received_invitations', to=settings.AUTH_USER_MODEL)),
                ('invite_sender', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sent_invitations', to=settings.AUTH_USER_MODEL)),
                ('tournament', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='invitations', to='tournament.tournament')),
            ],
        ),
        migrations.CreateModel(
            name='MatchResult',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('result', models.CharField(max_length=20)),
                ('match_score', models.CharField(max_length=10)),
                ('match_date', models.DateField(auto_now_add=True)),
                ('match_time', models.TimeField(auto_now_add=True)),
                ('match', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='result', to='tournament.tournamentmatch')),
                ('match_loser', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='lost_matches', to='tournament.tournamentplayer')),
                ('match_winner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='won_matches', to='tournament.tournamentplayer')),
            ],
        ),
    ]
