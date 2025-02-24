# tournament/serializers.py
from rest_framework import serializers

# Import the models from the tournament app
from .models import Tournament, TournamentPlayer, TournamentInvitation, TournamentRound, TournamentMatch, MatchResult
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync, sync_to_async
import logging
from django.db.models import F

# # Create a serializer for the TournamentRound model
# class TournamentRoundSerializer(serializers.ModelSerializer):
#         class Meta:
#             model = TournamentRound
#             fields = '__all__'

#  Create a serializer for the TournamentMatch model
class TournamentMatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentMatch
        fields = '__all__'

# Create a serializer for the TournamentPlayer model
class TournamentPlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentPlayer
        fields = '__all__'
        # Disable automatic unique validator
        extra_kwargs = {
            'player_identifier': {'validators': []},
            'player': {'validators': []},
        }
    def validate(self, data):
        user = self.context.get('user')
        tournament = data.get('tournament')
        # Check if the user is already a player in the specified tournament
        if TournamentPlayer.objects.filter(tournament=tournament, player=user).exists():
            raise serializers.ValidationError("You are already a player in this tournament.")
        # Check if the user already has a tournament player entry
        if TournamentPlayer.objects.filter(player=user).exists():
            raise serializers.ValidationError("You already in a tournament.")
        # Check if the tournament exists and has space
        if tournament.players_count >= tournament.tournament_size:
            raise serializers.ValidationError("Tournament is full.")
        # Check if the player identifier is unique
        if TournamentPlayer.objects.filter(tournament=tournament, player_identifier=data['player_identifier']).exists():
            raise serializers.ValidationError("Player identifier already exist.")
        return data

    def create(self, validated_data):
        tournament = validated_data['tournament']
        # increment the players count and avoid data race condition
        tournament.players_count = F ('players_count') + 1
        tournament.save()
        player = super().create(validated_data)
        return player


# Create a serializer for the Tournament model
class TournamentSerializer(serializers.ModelSerializer):
    #nested serializers
    players = TournamentPlayerSerializer(many=True, read_only=True)
    # get rounds with assciated matches
    rounds = serializers.SerializerMethodField()
    class Meta:
        model = Tournament
        fields = ['id', 'name', 'tournament_size', 'players', 'rounds', 'created_by', 'players_count', 'rounds_num']
        extra_kwargs = {
            'created_by': {'validators': []},
            'players_count': {'read_only': True},
        }
    # def validate_tournament_size(self, value):
    #     if value not in [4, 8, 16]:
    #         raise serializers.ValidationError("Tournament size must be one of [4, 8, 16].")
    #     return value
    # Check if the user already has a tournament
    def validate(self, data):
        user = self.context['request'].user
        if Tournament.objects.filter(created_by=user).exists():
            print("User already has a tournament")
            raise serializers.ValidationError("You already have a tournament.")
        # check if the user already joined a tournament
        if TournamentPlayer.objects.filter(player=user).exists():
            print("User already joined a tournament")
            raise serializers.ValidationError("You already joined a tournament.")
        return data
    def get_rounds(self, obj):
        # Get all rounds associated with the tournament
        rounds = obj.rounds.all()
        # Serialize rounds, including matches from each round
        return TournamentRoundSerializer(rounds, many=True).data
    def create(self, validated_data):
        tournament_size = validated_data.get('tournament_size', self.fields['tournament_size'].default)
        rounds_num = validated_data.get('rounds_num', Tournament.calculate_rounds(tournament_size))
        validated_data['created_by'] = self.context['request'].user
        tournament = super().create(validated_data)

        serializer = TournamentPlayerSerializer(data={
            'tournament': tournament.id,
            'player': tournament.created_by.id,
            'player_identifier': tournament.created_by.username
        })

        try:
            serializer.is_valid(raise_exception=True)
            serializer.save()
            tournament.refresh_from_db()
        except serializers.ValidationError as e:
            raise serializers.ValidationError("Failed to add the owner as a player.")
        return tournament


# Create a serializer for the TournamentInvitation model
class TournamentInvitationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentInvitation
        fields = ['invite_recipient']
        extra_kwargs = {
            'invite_sender': {'validators': []},
            'invite_recipient': {'validators': []},
        }
    def validate(self, data):
        tournament = self.context['tournament']
        invite_sender = self.context['invite_sender']
        invite_recipient = data['invite_recipient']
        # Check if the sender is the owner of the tournament
        if invite_sender != tournament.created_by:
            raise serializers.ValidationError("You are not the owner of the tournament.")
        # Check if the recipient is the owner of the tournament
        if invite_recipient == tournament.created_by:
            raise serializers.ValidationError("You are the owner of the tournament.")
        # Check if the recipient is already a player in the tournament
        if TournamentPlayer.objects.filter(tournament=tournament, player=invite_recipient).exists():
            raise serializers.ValidationError("Recipient is already a player in this tournament.")
        # Check if the recipient has an invitation
        if TournamentInvitation.objects.filter(tournament=tournament, invite_recipient=invite_recipient).exists():
            raise serializers.ValidationError("Recipient already has an invitation.")
        # Check if the recipient is already in a tournament
        if TournamentPlayer.objects.filter(player=invite_recipient).exists():
            raise serializers.ValidationError("Recipient is already in a tournament.")
        return data
    def create(self, validated_data):
        # Create the invitation
        validated_data['tournament'] = self.context['tournament']
        validated_data['invite_sender'] = self.context['invite_sender']
        invitation = super().create(validated_data)
        #send notification asynchronously
        invitation.send_websocket_notification()
        return invitation


class TournamentRoundSerializer(serializers.ModelSerializer):
    matches = TournamentMatchSerializer(many=True, read_only=True)

    class Meta:
        model = TournamentRound
        fields = ['id', 'tournament', 'round_number', 'matches']
    def validate(self, data):
        tournament = data.get('tournament')
        round_number = data.get('round_number')
        if TournamentRound.objects.filter(tournament=tournament, round_number=round_number).exists():
            raise serializers.ValidationError("Round already exists.")
        return data
    def create(self, validated_data):
        round_number = validated_data.get('round_number')
        tournament = validated_data.get('tournament')
        round_instance = super().create(validated_data)

        if round_number == 1:
            players = list(tournament.players.all())
        else:
            # Fetch winners from the previous round
            previous_round = tournament.rounds.filter(round_number=round_number - 1).first()
            if not previous_round:
                raise ValueError("Previous round data is missing.")

            players_ids = list(
                MatchResult.objects.filter(
                    match__round=previous_round,
                    match_winner__isnull=False
                ).values_list('match_winner', flat=True)
            )
            players = list(TournamentPlayer.objects.filter(id__in=players_ids))
        players_count = len(players)
        matches = []
        for i in range(0, players_count, 2):
            match = TournamentMatch.objects.create(
                round=round_instance,
                player1=players[i],
                player2=players[i + 1] if i + 1 < players_count else None
            )
            MatchResult.objects.create(
                match=match,
                match_winner=None,
            )
            matches.append(match)
        return round_instance






