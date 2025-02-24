import json
from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer
from .models import TournamentInvitation, TournamentPlayer, Tournament , TournamentRound, TournamentMatch, MatchResult
from .serializers import TournamentInvitationSerializer, TournamentPlayerSerializer, TournamentSerializer, TournamentRoundSerializer, TournamentMatchSerializer
from asgiref.sync import async_to_sync, sync_to_async
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from django.db.models import F
import logging
from rest_framework.exceptions import ValidationError
from django_redis import get_redis_connection
import time
import asyncio
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import User
from urllib.parse import parse_qs
from redisConnection import redisTournament
from django.forms.models import model_to_dict


class TournamentInvitationConsumer(WebsocketConsumer):
    def connect(self):
        user = self.scope['user']
        # fetch the token
        query_string = self.scope['query_string'].decode()
        query_params = parse_qs(query_string)
        token = query_params.get('token', [None])[0]
        if token:
            try:
                access_token = AccessToken(token)
                user_id = access_token['user_id']
                user = User.objects.get(id=user_id)
            except Exception as e:
                print(f"Error fetching user: {e}")
                self.close()
            self.group_name = f"invitation_{user.id}"
            try:
                async_to_sync(self.channel_layer.group_add)(self.group_name, self.channel_name)
                self.accept()
                # Retrieve undelivered invitations
                invitations = TournamentInvitation.objects.filter(invite_recipient=user)
                for invitation in invitations:
                    invitation.send_websocket_notification()
            except Exception as e:
                self.close()
        else:
            self.close()
    def send_invitation(self, event):
        # This method is used to send a message to the WebSocket
        message = event.get('message', '')
        tournament = event.get('tournament', {})
        
        # Ensure the event contains valid message and tournament data
        if message and tournament:
            self.send(text_data=json.dumps({
                'type': 'send_invitation',
                'message': message,
                'tournament': tournament,
                'invitation_id': event.get('invitation_id', ''),
            }))

    def disconnect(self, close_code):
        user = self.scope['user']
        if user.is_authenticated:
            async_to_sync(self.channel_layer.group_discard)(self.group_name, self.channel_name)

    # receive the invitation response from the recipient
    def receive(self, text_data):
        data = json.loads(text_data)
        response = data.get('response')
        invitation_id = data.get('invitation_id')
        invitation = TournamentInvitation.objects.filter(id=invitation_id).first()
        if invitation:
            serializer = TournamentInvitationSerializer()
            if response == 'accept':
                try :
                    serializer = TournamentPlayerSerializer(data={'tournament': invitation.tournament.id, 'player': invitation.invite_recipient.id, 'player_identifier': invitation.invite_recipient.username}, context={'user': invitation.invite_recipient})
                    serializer.is_valid(raise_exception=True)
                    serializer.save()
                    #redirect to the tournament lobby
                    self.send(text_data=json.dumps({
                        'action': 'redirect'
                    }))
                except ValidationError as e:
                    self.send(text_data=json.dumps(str(e)))
                invitation.delete()
                # close the connection
                # self.close()
            elif response == 'decline':
                invitation.delete()
                # close the connection
                # self.close()
            else:
                print("Invalid response.")
        else:
            print("Invalid invitation ID.")


class TournamentLobbyConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get token from query parameters
        query_string = self.scope['query_string'].decode()  # Decode the query string
        query_params = parse_qs(query_string)  # Parse query string
        token = query_params.get('token', [None])[0]  # Get token value (None if not present)
        self.player_identifier = None
        if token:
            try:
                # Verify token
                access_token = AccessToken(token)
                user_id = access_token['user_id']  # Extract user_id from token
                user = await sync_to_async(User.objects.get)(id=user_id)  # Retrieve user from DB
                self.user = user
                # check if the user is a player in the tournament
                player = await sync_to_async(lambda: TournamentPlayer.objects.filter(
                            player_identifier = user.username,
                            tournament_id=self.scope['url_route']['kwargs']['tournament_id']
                        ).first())()
                if user.is_authenticated and player:
                    self.player_identifier = user.username
                    self.tournament_id = self.scope['url_route']['kwargs']['tournament_id']
                    self.lobby_group_name = f"lobby_{self.tournament_id}"
                    try:
                        await self.channel_layer.group_add(
                            self.lobby_group_name,
                            self.channel_name
                        )
                        await self.accept()
                        await self.broadcast_player_list("player_joined")
                    except Exception as e:
                        await self.close()
                else:
                    await self.close()
            except Exception as e:
                return
        else:
            await self.close()


    async def disconnect(self, close_code):
        if self.player_identifier:
            await self.channel_layer.group_discard(
                self.lobby_group_name,
                self.channel_name
            )

    async def confirm_disconnect(self, event):
        await self.send(text_data=json.dumps({
            'type': 'confirm_disconnect',
            'message': event['message']
        }))
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        tournament = await sync_to_async(Tournament.objects.get)(id=self.tournament_id)
        created_by = await sync_to_async(lambda: tournament.created_by)()
        if text_data_json.get('action') == 'leave_tournament':
            if self.player_identifier:
                await self.send(text_data=json.dumps({
                    'type': 'confirm_disconnect',
                    'message': 'Are you sure you want to leave the tournament?'
                }))
            else:
                print(f"Player leaving the tournament: {self.player_identifier}")
            await self.leave_tournament()
        elif text_data_json.get('action') == 'kick_player':
            player_to_kick = text_data_json.get('player')
            if created_by.username == self.player_identifier and player_to_kick != created_by.username:
                player_instance = await sync_to_async(lambda: TournamentPlayer.objects.filter(
                    player_identifier = player_to_kick,
                    tournament_id=self.tournament_id
                ).first())()
                if player_instance:
                    await sync_to_async(self.delete_player)(player_instance)
                    await self.broadcast_player_list("player_left")
        elif text_data_json.get('action') == 'start_tournament':
            if created_by.username == self.player_identifier:
                if tournament.players_count == tournament.tournament_size:
                    try:
                        def validate_and_create_round():
                            serializer = TournamentRoundSerializer(data={'tournament': self.tournament_id,'round_number': 1})
                            serializer.is_valid(raise_exception=True)
                            return serializer.save()
                        first_round = await sync_to_async(validate_and_create_round)()
                        # notify all players to start the tournament
                        channel_layer = get_channel_layer()
                        await channel_layer.group_send(
                            f"lobby_{self.tournament_id}",
                            {
                                'type': 'start_tournament',
                                'round_url': f"/tournament/{self.tournament_id}/round/{first_round.round_number}/"
                            }
                        )
                    except ValidationError as e:
                        print(f"Validation error: {str(e)}")
                        await self.send(text_data=json.dumps({
                            'type': 'error',
                            'message': str(e)
                        }))
                        return
                else:
                    print("Tournament is not full.")
                    await self.send(text_data=json.dumps({
                        'type': 'error',
                        'message': 'Tournament is not full.'
                    }))
            else:
                print("You are not the owner of the tournament.")
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'You are not the owner of the tournament.'
                }))
        elif text_data_json.get('action') == "confirm_disconnect":
            print(f"Received disconnect confirmation from owner: {self.player_identifier}")
            self.owner_ready_to_disconnect = True
        else:
            print("Invalid action.")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid action.'
            }))
    async def error(self, event):
        print(f"Error event received: {event}")
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': event['message']
        }))
    async def start_tournament(self, event):
        print(f"Starting tournament: {event['round_url']}")
        await self.send(text_data=json.dumps({
            'type': 'start_tournament',
            'round_url': event['round_url'],
        }))

    async def leave_tournament(self):
        # check if self.player_identifier is in the tournamen
        if not self.player_identifier:
            print("Player identifier not found.")
            return
        try:
            player_instance = await sync_to_async(TournamentPlayer.objects.get)(
                player_identifier=self.player_identifier,
                tournament_id=self.tournament_id
            )
            if not player_instance:
                print("Player not found.")
                return
            await sync_to_async(self.delete_player)(player_instance)
            await self.broadcast_player_list("player_left")
            print(f"Disonnecting player: {self.player_identifier}")
            await self.close()
        except TournamentPlayer.DoesNotExist:
            print(f"Player not found. Tried to find player with:")
            print(f"player_identifier: {self.player_identifier}")
            print(f"tournament_id: {self.tournament_id}")
    def delete_player(self, player_instance):
        tournament = player_instance.tournament
        tournament.players_count = F('players_count') - 1
        tournament.save()
        tournament.refresh_from_db()
        player_instance.delete()
        # fetch owner of the tournament
        created_by = tournament.created_by
        print (f"created_by: {created_by.username}")
        print (f"player_instance: {player_instance.player_identifier}")
        if created_by.username == player_instance.player_identifier:
            print("Deleting tournament...")
            tournament.delete()
    async def broadcast_player_list(self, event_type):
        players = await self.get_current_players()
        player_count = len(players)
        print(f"Broadcasting {event_type}: {players} ({player_count})")
        await self.channel_layer.group_send(
            self.lobby_group_name,
            {
                'type': event_type,
                'players': players,
                'player_count': player_count,
            }
        )
    async def get_current_players(self):
        return await sync_to_async(list)(
            TournamentPlayer.objects.filter(
                tournament_id=self.tournament_id
            ).values_list('player_identifier', flat=True)
        )
    async def player_joined(self, event):
        print(f"Player joined event received: {event}")
        await self.send(text_data=json.dumps({
            'type': 'player_joined',
            'players': event['players'],
            'player_count': event['player_count'],
        }))

    async def player_left(self, event):
        print(f"Player left event received: {event}")
        await self.send(text_data=json.dumps({
            'type': 'player_left',
            'players': event['players'],
            'player_count': event['player_count'],
        }))

class TournamentRoundConsumer(AsyncWebsocketConsumer):
    #connect to the websocket
    async def connect(self):
        # fetch the token
        query_string = self.scope['query_string'].decode()
        query_params = parse_qs(query_string)
        token = query_params.get('token', [None])[0]
        if token:
            try:
                access_token = AccessToken(token)
                user_id = access_token['user_id']
                user = await sync_to_async(User.objects.get)(id=user_id)
                self.user = user
                self.round_number = self.scope['url_route']['kwargs']['round_number']
                self.tournament_id = self.scope['url_route']['kwargs']['tournament_id']
                self.round_group_name = f"round_{self.tournament_id}_{self.round_number}"
                self.round = await sync_to_async(lambda: TournamentRound.objects.filter(
                    tournament_id=self.tournament_id,
                    round_number=self.round_number
                ).first())()
                if self.round:
                    print(f"Round Details: {model_to_dict(self.round)}")
                else:
                    print("Round not foundddd.")

                # Check if the user is a player in the tournament
                player = await sync_to_async(lambda: TournamentPlayer.objects.filter(
                    player_identifier=user.username,
                    tournament_id=self.tournament_id
                ).first())()
                if user.is_authenticated and player:
                    print("\033[92m" + f"User {user} connected to round {self.round_number}.")
                    print("\033[0m")
                    try:
                        # Add user to the WebSocket group
                        await self.channel_layer.group_add(
                            self.round_group_name,
                            self.channel_name
                        )
                        await self.accept()
                        if self.round_number == '1':
                            players = await sync_to_async(
                                lambda: list(TournamentPlayer.objects.filter(
                                    tournament_id=self.tournament_id
                                ).order_by('joined_time'))
                            )()
                        else:
                            previous_round = await sync_to_async(
                                lambda: TournamentRound.objects.filter(
                                    tournament_id=self.tournament_id,
                                    round_number=int(self.round_number) - 1
                                ).first()
                            )()
                            if not previous_round:
                                raise ValueError("Previous round data is missing.")
                            # Fetch winners from the previous round's matches
                            players_ids = await sync_to_async(
                                lambda: list(
                                    MatchResult.objects.filter(
                                        match__round=previous_round,
                                        match_winner__isnull=False
                                    ).values_list('match_winner', flat=True)
                                ))()
                            players = await sync_to_async(
                                lambda: list(TournamentPlayer.objects.filter(
                                    id__in=players_ids
                                ).order_by('joined_time'))
                            )()
                        # Create a Redis connection
                        # redis_conn = get_redis_connection("default")
                        player_order_key = f"{self.tournament_id}:player_order"
                        player_channel_key = f"{self.tournament_id}:player_channels"
                        # Only populate the player_order_key list if it's empty
                        if redisTournament.llen(player_order_key) == 0:  # Check if the list is empty
                            # Populate the list with the player identifiers in the exact order of creation
                            for p in players:
                                redisTournament.rpush(player_order_key, p.player_identifier)
                        # Update Redis with player identifiers in the exact order of creation and store their channels
                        for p in players:
                            # Store the current player's WebSocket channel in the hash
                            if p.player_identifier == user.username:
                                # Set the current player's WebSocket channel
                                redisTournament.hset(player_channel_key, user.id, self.channel_name)
                                redisTournament.hset(player_channel_key, p.player_identifier, self.channel_name)
                                print(f"Stored player {p.player_identifier} with channel {self.channel_name} in Redis.")
                            else:
                                # Ensure a placeholder for players who haven't connected yet
                                channel = redisTournament.hget(player_channel_key, p.player_identifier)
                                if channel is None:
                                    redisTournament.hset(player_channel_key, p.player_identifier, "not_connected")
                    except Exception as e:
                        print(f"Error in WebSocket connect3: {e}")
                        await self.close()
                    # Fetch round data for the specific user
                    match_data = await self.fetch_round_data(user)
                    if match_data:
                        try:
                            await self.send(text_data=json.dumps({
                                'match_data': match_data
                            }))
                        except Exception as e:
                            print(f"Error sending round data: {e}")
                            await self.close()
                    else:
                        print("No match data found.")
                        await self.close()
                else:
                    print("User is not authenticated or not found.")
                    await self.close()
                    ########################################
            except Exception as e:
                print(f"Error fetching user: {e}")
                await self.close()
        else:
            print("Token not found.")
            await self.close()
        
    #disconnect from the websocket
    async def disconnect(self, close_code):
        print(f"WebSocket disconnected with code: {close_code}")
        # await self.channel_layer.group_send(
        #     self.round_group_name,
        #     {
        #         'type': 'player_disconnected',
        #     }
        # )
        await self.channel_layer.group_discard(
            self.round_group_name,
            self.channel_name
        )
        # delete the player from the Redis store
        # redis_conn = get_redis_connection("default")
        player_order = redisTournament.get(f"{self.round_group_name}:player_order")
        if player_order:
            player_order = json.loads(player_order)
            player_identifier = await sync_to_async(lambda: TournamentPlayer.objects.filter(
                player_identifier=self.scope['user'].username,
                tournament_id=self.tournament_id
            ).first().player_identifier)()
            if player_identifier in player_order:
                player_order.pop(player_identifier)
                redisTournament.set(f"{self.round_group_name}:player_order", json.dumps(player_order))
    async def player_disconnected(self, event):
        await self.send(text_data=json.dumps({
            'type': 'player_disconnected',
        }))
    async def fetch_round_data(self, user):
        try:
            round_data = self.round
            if round_data:
                print(f"Round data found")
                matches = await sync_to_async(list)(
                    round_data.matches.all().select_related('player1', 'player2')
                )
                user_match = {}
                for match in matches:
                    player1_id = await sync_to_async(lambda: match.player1.player_identifier)()
                    player2_id = await sync_to_async(lambda: match.player2.player_identifier)()
                    if user.username == player1_id or user.username == player2_id:
                            user_match['message'] = f"Hey {user.username}, Your match is against {player2_id if user.username == player1_id else player1_id} Press Play to start the match."
                            user_match['match_id'] = match.id
                            user_match['player'] = user.username
                            user_match['opponent'] = player2_id if user.username == player1_id else player1_id
                            user_match['match_status'] = match.match_status
                print (f"User match: {user_match}")
                return user_match
            else:
                print("No round data found.")
                return {}
        except Exception as e:
            print(f"Error fetching round data: {e}")
            return {}

    async def receive(self, text_data):
        data = json.loads(text_data)
        data_type = data.get('type')
        if data_type == 'play_match':
            match_id = data.get('match_id')
            player = data.get('player')
            action = data.get('action')
            if match_id and player and action:
                await self.play_match(match_id, player, action)
                round_data = self.round
                matches = await sync_to_async(list)(
                    round_data.matches.all().select_related('player1', 'player2')
                )
                all_matches_active = all(
                    match.match_status == 'Active' for match in matches
                )
                if all_matches_active:
                    #update the round status to active
                    await sync_to_async(lambda: setattr(round_data, 'round_status', 'Active'))()
                    await sync_to_async(round_data.save)()
                    print(f"Round {self.round_number} is now active.")
            else:
                print("Invalid data received.")
                await self.close()
        elif data_type == 'photo_update':
            await self.channel_layer.group_send(
                self.round_group_name,
                {
                    'type': 'photo_update',
                    'match_id': data.get('match_id'),
                    'position': data.get('position'),
                    'winner': data.get('winner'),
                    'photo_url': data.get('photo_url'),
                }
            )
        elif data_type == 'delete_tournament':
            print("Deleting tournament...")
            await self.delete_tournament()

        elif data_type == 'player_disconnected':
            print("Received disconnect confirmation.")
            await self.channel_layer.group_send(
                self.round_group_name,
                {
                    'type': 'player_disconnected',
                }
            )
        else :
            print("Invalid data type received.")

    async def delete_tournament(self):
        print(f"Tournament ID: {self.tournament_id}")
        tournament = await sync_to_async(Tournament.objects.filter(id=self.tournament_id).first)()
        if not tournament:
            print(f"Tournament with ID {self.tournament_id} does not exist.")
            return
        await sync_to_async(tournament.delete)()

    async def photo_update(self, event):
        print(f"Photo update: {event}")
        await self.send(text_data=json.dumps({
            'type': 'photo_update',
            'match_id': event['match_id'],
            'position': event['position'],
            'winner': event['winner'],
            'photo_url': event['photo_url'],
        }))
    async def final_round(self, event):
        await self.send(text_data=json.dumps({
            'type': 'final_round',
            'match_id': event['match_id'],
            'all_matches_id': event['all_matches_id'],
            'winner': event['winner'],
            'loser': event['loser'],
            'message': event['message'],
            'round_url': event['round_url'],
        }))

    async def tournament_winner(self, event):
        print(f"Tournament winner: {event['message']}")
        await self.send(text_data=json.dumps({
            'type': 'tournament_winner',
            'winner': event['winner'],
            'loser': event['loser'],
            'message': event['message'],
        }))

    async def round_completed(self, event):
        await self.send(text_data=json.dumps({
            'type': 'round_completed',
            'round_url': event['round_url'],
        }))
    #ping the user and update the match result
    async def process_match_results(self, event):
        # game gonna ping the user and i should update the match result and add him as winner
        # fetch the player using his user id 
        player = await sync_to_async(lambda: TournamentPlayer.objects.filter(
            player_identifier=self.user.username,
            tournament_id=self.tournament_id
        ).first())()
        # check which match the player is in
        match = await sync_to_async(lambda: TournamentMatch.objects.filter(
            round__tournament_id=self.tournament_id,
            player1=player,
            match_status='Active'
        ).first())()
        if not match:
            match = await sync_to_async(lambda: TournamentMatch.objects.filter(
                round__tournament_id=self.tournament_id,
                player2=player,
                match_status='Active'
            ).first())()
        if match:
            all_matches = await sync_to_async(lambda: list(match.round.matches.all().values_list('id', flat=True)))()
            # send a ping to the player
            player_channel_winner = await sync_to_async(redisTournament.hget)(f"{self.tournament_id}:player_channels", self.user.id)
            # check the user opponent id
            player_identifier1 = await sync_to_async(lambda: match.player1.player_identifier)()
            player_identifier2 = await sync_to_async(lambda: match.player2.player_identifier)()
            if player_identifier1 == self.user.username:
                player_channel_loser = await sync_to_async(redisTournament.hget)(f"{self.tournament_id}:player_channels", player_identifier2)
                loser = await sync_to_async(lambda: match.player2.player.id)()
                print("loser: ", loser)
            else:
                player_channel_loser = await sync_to_async(redisTournament.hget)(f"{self.tournament_id}:player_channels", player_identifier1)
                loser = await sync_to_async(lambda: match.player1.player.id)()
                print("loser: ", loser)
            if player_channel_winner:
                channel_layer = get_channel_layer()
                #print the round number
                if self.round_number == '1':
                    event_type = 'final_round'
                else:
                    event_type = 'tournament_winner'
                if self.round_number == '1':
                    round_url = f"/tournament/{self.tournament_id}/round/{int(self.round_number) + 1}/"
                else:
                    round_url = None

                await channel_layer.send(
                    player_channel_winner,
                    {
                        'type': event_type,
                        'message': 'Won',
                        'match_id': match.id,
                        'all_matches_id': all_matches,
                        'winner': self.user.id,
                        'loser': loser,
                        'round_url': round_url,
                    }
                )
            if player_channel_loser:
                await channel_layer.send(
                    player_channel_loser,
                    {
                        'type': event_type,
                        'message': 'Lost',
                        'match_id': match.id,
                        'all_matches_id': all_matches,
                        'winner': self.user.id,
                        'loser': loser,
                        'round_url': round_url,
                    }
                )
            # update the match result
            match_result = await sync_to_async(lambda: MatchResult.objects.filter(
                match=match
            ).first())()
            if match_result:
                await sync_to_async(lambda: setattr(match_result, 'match_winner', player))()
                await sync_to_async(match_result.save)()
                print(f"Match result updated for player {player.player_identifier}")
            match.match_status = 'Completed'
            await sync_to_async(match.save)()
            round_data = self.round
            matches = await sync_to_async(lambda: list(round_data.matches.all().select_related('player1', 'player2')))()
            all_matches_completed = all(
                match.match_status == 'Completed' for match in matches
            )
            if all_matches_completed:
                print(f"All matches in round {self.round_number} are completed.")
                # update round status to completed
                await sync_to_async(lambda: setattr(round_data, 'round_status', 'Completed'))()
                await sync_to_async(round_data.save)()
                # create the next round
                if self.round_number == "1":
                    await self.create_next_round()
                    # send the next round url to the players
                    channel_layer = get_channel_layer()
                    await channel_layer.group_send(
                        self.round_group_name,
                        {
                            'type': 'round_completed',
                            'round_url': round_url,
                        }
                    )
            else:
                print(f"Not all matches in round {self.round_number} are completed.")
    #create the next round
    async def create_next_round(self):
        # Logic to create the next round
        try:
            # Ensure round_number is an integer
            round_number = int(self.round_number)
            # Use sync_to_async to handle ORM calls in async context
            serializer = TournamentRoundSerializer(data={
                'tournament': self.tournament_id,
                'round_number': round_number + 1
            })
            # Validate and save the serializer within a sync_to_async context
            await sync_to_async(serializer.is_valid, thread_sensitive=True)(raise_exception=True)
            await sync_to_async(serializer.save, thread_sensitive=True)()
        except ValidationError as e:
            print(f"Validation error: {str(e)}")

    #play the match
    async def play_match(self, match_id, player, action):
        try:
            match = await sync_to_async(TournamentMatch.objects.get)(id=match_id)
        except TournamentMatch.DoesNotExist:
            print(f"Match not found: {match_id}")
            return
        # redis_conn = get_redis_connection("default")
        match_key = f"match_{match_id}"
        match_actions = redisTournament.hgetall(match_key)
        match_actions = {
            k: (v if v else None)
            for k, v in match_actions.items()
        }
        if not match_actions:
            match_actions = {'player1_action': "null", 'player2_action': "null"}
            redisTournament.hmset(match_key, match_actions)
            print(f"Initialized actions for match {match_id}")
        player1_identifier = await sync_to_async(lambda: match.player1.player_identifier)()
        player2_identifier = await sync_to_async(lambda: match.player2.player_identifier)()
        if player == player1_identifier and match_actions['player1_action'] == "null":
            match_actions['player1_action'] = action
        elif player == player2_identifier and match_actions['player2_action'] == "null":
            match_actions['player2_action'] = action
        if match_actions['player1_action'] != "null" and match_actions['player2_action'] != "null":
            await sync_to_async(lambda: setattr(match, 'match_status', 'Active'))()
            await sync_to_async(match.save)()
            redisTournament.delete(match_key)
            player1_id = await sync_to_async(lambda: match.player1.player.id)()
            player2_id = await sync_to_async(lambda: match.player2.player.id)()
            p_session = f"session_{player1_id}_{player2_id}"
            print (f"Player_1: {player1_id} Player_2: {player2_id}")
            player1_channel = redisTournament.hget(f"{self.tournament_id}:player_channels", player1_identifier)
            player2_channel = redisTournament.hget(f"{self.tournament_id}:player_channels", player2_identifier)
            # send the player channel to the group channel
            channel_layer = get_channel_layer()
            # Send message to player1_channel
            if player1_channel:
                print (f"Player1_channel: {player1_channel}")
                await channel_layer.send(
                    player1_channel,  # Send message to player 1's channel
                    {
                        'type': 'match_session',
                        'tournament_id' : self.tournament_id,
                        'player1': player1_id,
                        'player2': player2_id,
                        'p_session': p_session,
                    }
                )

            # Send message to player2_channel
            if player2_channel:
                print (f"Player2_channel: {player2_channel}")
                await channel_layer.send(
                    player2_channel,  # Send message to player 2's channel
                    {
                        'type': 'match_session',
                        'tournament_id' : self.tournament_id,
                        'player1': player1_id,
                        'player2': player2_id,
                        'p_session': p_session,
                    }
                )
        else:
            #Store the updated actions into Redis
            match_actions = {
                key: value if value != None else "null" for key, value in match_actions.items()
            }
            redisTournament.hmset(match_key, match_actions)
    
    async def match_session(self, event):
        my_id = self.user.id
        if (event.get('player1') == my_id):
            your_id = event.get('player2')
        else:    
            your_id = event.get('player1')
            my_id = event.get('player2')
        p_session = event.get('p_session')
        await self.send(text_data=json.dumps({
            'type': 'match_session',
            'my_id': my_id,
            'your_id': your_id,
            'tournament_id': event.get('tournament_id'), 
            'p_session': event.get('p_session'),
        }))