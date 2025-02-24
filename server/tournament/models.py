from django.db import models
from django.contrib.auth.models import User
from django.db.models.deletion import CASCADE
from django.db.models.fields import CharField, IntegerField, DateField, TimeField
from asgiref.sync import async_to_sync

# Create your models here.

class Tournament(models.Model):
    STATUS_DRAFT = 'Draft'
    STATUS_ACTIVE = 'Active'
    STATUS_COMPLETED = 'Completed'

    TOURNAMENT_STATUS_CHOICES = [
        (STATUS_DRAFT, 'Draft'),
        (STATUS_ACTIVE, 'Active'),
        (STATUS_COMPLETED, 'Completed'),
    ]
    name = models.CharField(max_length=200)
    creation_date = models.DateField(auto_now_add=True)
    created_by = models.OneToOneField(User, on_delete=models.CASCADE)
    tournament_status = models.CharField(max_length=20, choices=TOURNAMENT_STATUS_CHOICES, default='Draft')
    tournament_size = models.IntegerField(default=4)
    players_count = models.IntegerField(default=0)
    rounds_num = models.IntegerField(default=0)
    @staticmethod
    def calculate_rounds(tournament_size):
        if tournament_size == 4:
            return 2
        elif tournament_size == 8:
            return 3
        elif tournament_size == 16:
            return 4
        return 0
    def __str__(self):
        return f"Tournament: {self.id}"

class TournamentPlayer(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='players')
    player = models.OneToOneField(User, on_delete=models.CASCADE, related_name='tournaments')
    # player_type True for owner, False for player
    player_type = models.BooleanField(default=False)
    joined_date = models.DateField(auto_now_add=True)
    joined_time = models.TimeField(auto_now_add=True)
    player_identifier = models.CharField(max_length=20)
    def __str__(self):
        return f"Tournament player: {self.player.username} in {self.tournament.name}"

class TournamentInvitation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
    ]
    tournament = models.ForeignKey('Tournament', on_delete=models.CASCADE, related_name='invitations')
    invite_sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_invitations')  # The owner of the tournament
    invite_recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_invitations')  # The invited player
    invite_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    # updated_at = models.DateTimeField(auto_now=True)
    def send_websocket_notification(self):
        from channels.layers import get_channel_layer
        channel_layer = get_channel_layer()
        print(f"channel_layer: {channel_layer}")
        tournament_details = {
            'id': self.tournament.id,
            'name': self.tournament.name,
            'creator': self.tournament.created_by.username,
            'size': self.tournament.tournament_size
        }
        try:
            async_to_sync(channel_layer.group_send)(
                f"invitation_{self.invite_recipient.id}",
                {
                    'type': 'send_invitation',
                    'message': 'You have a new tournament invitation',
                    'invitation_id': self.id,
                    'tournament': tournament_details,
                    'sender': self.invite_sender.username
                }
            )
            print(f"WebSocket notification sent to user {self.invite_recipient.id}")
        except Exception as e:
            print(f"Failed to send WebSocket notification: {e}")
    def __str__(self):
        return f"Invitation to {self.invite_recipient.username} for {self.tournament.name} ({self.invite_status})"

class TournamentRound(models.Model):
    ROUND_STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Active', 'Active'),
        ('Completed', 'Completed'),
    ]
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='rounds')
    round_number = models.IntegerField()
    round_status = models.CharField(max_length=20, choices=ROUND_STATUS_CHOICES, default='Pending')
    def __str__(self):
        return f"Round {self.round_number} of {self.tournament.id}"

class TournamentMatch(models.Model):
    MATCH_STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Active', 'Active'),
        ('Completed', 'Completed'),
    ]
    round = models.ForeignKey(TournamentRound, on_delete=models.CASCADE, related_name='matches')
    # parent_match = models.ForeignKey('self', on_delete=models.CASCADE, related_name='child_matches', null=True, blank=True)
    match_date = models.DateField(auto_now_add=True)
    player1 = models.ForeignKey(TournamentPlayer, on_delete=models.CASCADE, related_name='player1_matches')
    player2 = models.ForeignKey(TournamentPlayer, on_delete=models.CASCADE, related_name='player2_matches')
    match_status = models.CharField(max_length=20, choices=MATCH_STATUS_CHOICES, default='Pending')
    def __str__(self):
        return (
            f"Match between Player {self.player1_id} and Player {self.player2_id} "
            f"in round {self.round.round_number} "
            f"of tournament {self.round.tournament_id}"
        )


class MatchResult(models.Model):
    match = models.OneToOneField(TournamentMatch, on_delete=models.CASCADE, related_name='result')
    match_score = models.CharField(max_length=10)
    match_date = models.DateField(auto_now_add=True)
    match_time = models.TimeField(auto_now_add=True)
    match_winner = models.ForeignKey(TournamentPlayer, on_delete=models.CASCADE, related_name='won_matches', null=True, blank=True)
    match_loser = models.ForeignKey(TournamentPlayer, on_delete=models.CASCADE, related_name='lost_matches', null=True, blank=True)
    def __str__(self):
        return f"Result of match between {self.match.player1.player.username} and {self.match.player2.player.username}: Winner: {self.match_winner}, Loser: {self.match_loser}"

