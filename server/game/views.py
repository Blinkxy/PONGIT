from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.decorators import  permission_classes
from game.models import History 
from .serializers import HistorySerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Max, F
from django.db.models import Q
from django.contrib.auth.models import User
from server.models import UserProfile
from django.shortcuts import get_object_or_404
from .models import History


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def playerHistory(request, user_id):
    if request.method == "GET":
        # Initialize empty response list
        response_data = []
        
        # Get all matches for the user
        history = History.objects.filter(player_id=user_id)
        
        # Process matches if they exist
        for match in history:
            match_data = HistorySerializer(match).data

            try:
                opponent_user = User.objects.get(id=match.opponent)
                opponent_profile = opponent_user.profile 
                
                # Add opponent details
                match_data['opponent_profile_image'] = (
                    opponent_profile.profile_image.url 
                    if opponent_profile.profile_image 
                    else None
                )
                match_data['opponent_username'] = opponent_user.username
                
                # Determine match status
                match_data['status'] = (
                    'win' if match.playerScore > match.opponentScore 
                    else 'lose'
                )
                
            except (User.DoesNotExist, UserProfile.DoesNotExist, AttributeError):
                match_data['opponent_profile_image'] = None
                match_data['opponent_username'] = None
            
            response_data.append(match_data)
        
        return Response(response_data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lastTwoMatchesSimple(request, user_id):
    if request.method == "GET":
        response_data = []
        
        # Get last 2 matches
        history = History.objects.filter(player_id=user_id).order_by('-date_game')[:2]
        
        for match in history:
            try:
                opponent_user = User.objects.get(id=match.opponent)
                opponent_profile = opponent_user.profile
                opponent_image = opponent_profile.profile_image.url if opponent_profile.profile_image else None
            except (User.DoesNotExist, UserProfile.DoesNotExist, AttributeError):
                opponent_image = None

            match_data = {
                'date': match.date_game,
                'result': 'win' if match.playerScore > match.opponentScore else 'lose',
                'opponent_image': opponent_image,
                'playerScore': match.playerScore,
                'opponentScore': match.opponentScore
            }
            response_data.append(match_data)
            
        return Response(response_data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lastWinMatch(request, user_id):
    if request.method == "GET":
        try:
            match = History.objects.filter(
                player_id=user_id,
                playerScore__gt=F('opponentScore')  # Filter where playerScore > opponentScore
            ).latest('date_game')
            
            try:
                opponent_user = User.objects.get(id=match.opponent)
                opponent_profile = opponent_user.profile
                opponent_image = opponent_profile.profile_image.url if opponent_profile.profile_image else None
            except (User.DoesNotExist, UserProfile.DoesNotExist, AttributeError):
                opponent_image = None

            match_data = {
                'date': match.date_game,
                'result': 'win',
                'opponent_image': opponent_image,
                'playerScore': match.playerScore,
                'opponentScore': match.opponentScore
            }
            
            return Response(match_data, status=status.HTTP_200_OK)
            
        except History.DoesNotExist:
            return Response(
                {'message': 'No wins found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def playerStats(request, user_id):
    if request.method == "GET":
        history = History.objects.filter(player_id=user_id)
        
        # Default response for users with no matches
        response_data = {
            'total_games': 0,
            'wins': 0,
            'losses': 0,
            'win_rate': 0,
            'biggest_win': None,
            'biggest_loss': None
        }
        
        if history.exists():
            total_games = history.count()
            wins = 0
            losses = 0
            biggest_win = {'score_difference': 0, 'match': None}
            biggest_loss = {'score_difference': 0, 'match': None}
            
            for match in history:
                score_difference = match.playerScore - match.opponentScore
                
                if score_difference > 0:
                    wins += 1
                    if score_difference > biggest_win['score_difference']:
                        biggest_win['score_difference'] = score_difference
                        biggest_win['match'] = match
                else:
                    losses += 1
                    if abs(score_difference) > biggest_loss['score_difference']:
                        biggest_loss['score_difference'] = abs(score_difference)
                        biggest_loss['match'] = match
            
            # Prepare biggest win/loss details
            biggest_win_data = None
            if biggest_win['match']:
                try:
                    opponent = User.objects.get(id=biggest_win['match'].opponent)
                    opponent_profile = opponent.profile
                    biggest_win_data = {
                        'opponent_username': opponent.username,
                        'opponent_profile_image': opponent_profile.profile_image.url if opponent_profile.profile_image else None,
                        'player_score': biggest_win['match'].playerScore,
                        'opponent_score': biggest_win['match'].opponentScore,
                        'score_difference': biggest_win['score_difference'],
                        'date': biggest_win['match'].date_game
                    }
                except (User.DoesNotExist, AttributeError):
                    pass

            biggest_loss_data = None
            if biggest_loss['match']:
                try:
                    opponent = User.objects.get(id=biggest_loss['match'].opponent)
                    opponent_profile = opponent.profile
                    biggest_loss_data = {
                        'opponent_username': opponent.username,
                        'opponent_profile_image': opponent_profile.profile_image.url if opponent_profile.profile_image else None,
                        'player_score': biggest_loss['match'].playerScore,
                        'opponent_score': biggest_loss['match'].opponentScore,
                        'score_difference': biggest_loss['score_difference'],
                        'date': biggest_loss['match'].date_game
                    }
                except (User.DoesNotExist, AttributeError):
                    pass

            win_rate = round((wins / total_games * 100), 2) if total_games > 0 else 0
            
            response_data.update({
                'total_games': total_games,
                'wins': wins,
                'losses': losses,
                'win_rate': int(win_rate),
                'biggest_win': biggest_win_data,
                'biggest_loss': biggest_loss_data
            })
        
        return Response(response_data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def playerRanks(request, user_id):
    if request.method == "GET":
        # Only get active users with games
        users_with_games = History.objects.filter(
            player__is_active=True
        ).values('player_id').distinct()
        
        rankings = []
        
        for user_entry in users_with_games:
            user_id = user_entry['player_id']
            try:
                # Additional check for active users
                user = User.objects.get(id=user_id, is_active=True)
                history = History.objects.filter(player_id=user_id)
                
                total_games = history.count()
                wins = sum(1 for match in history if match.playerScore > match.opponentScore)
                losses = total_games - wins
                win_rate = round((wins / total_games * 100), 2) if total_games > 0 else 0
                
                rankings.append({
                    'user_id': user_id,
                    'username': user.username,
                    'profile_image': user.profile.profile_image.url if hasattr(user, 'profile') and user.profile.profile_image else None,
                    'total_games': total_games,
                    'wins': wins,
                    'losses': losses,
                    'win_rate': win_rate
                })
                
            except User.DoesNotExist:
                continue

        rankings.sort(key=lambda x: (x['wins'], x['win_rate']), reverse=True)

        for index, rank_entry in enumerate(rankings, 1):
            rank_entry['rank'] = index
        
        return Response(rankings, status=status.HTTP_200_OK)




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def myRank(request, user_id):
    if request.method == "GET":
        # Check if the player has any game history
        if not History.objects.filter(player_id=user_id).exists():
            return Response({
                "user_id": user_id,
                "username": User.objects.get(id=user_id).username if User.objects.filter(id=user_id).exists() else "Unknown",
                "profile_image": None,
                "total_games": 0,
                "wins": 0,
                "losses": 0,
                "win_rate": 0.0,
                "rank": "Unranked"
            }, status=status.HTTP_200_OK)
        users_with_games = History.objects.values('player_id').distinct()
        rankings = []

        for user_entry in users_with_games:
            player_id = user_entry['player_id']
            history = History.objects.filter(player_id=player_id)
            total_games = history.count()
            wins = 0
            losses = 0

            for match in history:
                if match.playerScore > match.opponentScore:
                    wins += 1
                else:
                    losses += 1

            try:
                user = User.objects.get(id=player_id)
                user_profile = user.profile
                win_rate = round((wins / total_games * 100), 2) if total_games > 0 else 0
                rankings.append({
                    'user_id': player_id,
                    'username': user.username,
                    'profile_image': user_profile.profile_image.url if user_profile.profile_image else None,
                    'total_games': total_games,
                    'wins': wins,
                    'losses': losses,
                    'win_rate': win_rate
                })
            except (User.DoesNotExist, AttributeError):
                continue

        rankings.sort(key=lambda x: (x['wins'], x['win_rate']), reverse=True)

        user_rank = None
        for i, item in enumerate(rankings):
            if item['user_id'] == int(user_id):
                user_rank = i
                break

        if user_rank is not None:
            user_data = rankings[user_rank]
            user_data['rank'] = user_rank + 1
            return Response(user_data, status=status.HTTP_200_OK)

        return Response({"error": "User not found in rankings"}, status=status.HTTP_404_NOT_FOUND)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def topRanks(request, current_user_id):
    if request.method == "GET":
        
        if not History.objects.exists():
            return Response({"error": "No games played"}, status=status.HTTP_404_NOT_FOUND)

        # Filter for active users only
        users_with_games = History.objects.filter(
            player__is_active=True
        ).values('player_id').distinct()
        
        rankings = []
    
        for user_entry in users_with_games:
            player_id = user_entry['player_id']
            try:
                # Get only active users
                user = User.objects.get(id=player_id, is_active=True)
                
                history = History.objects.filter(player_id=player_id)
                total_games = history.count()
                wins = 0
                losses = 0
                for match in history:
                    score_difference = match.playerScore - match.opponentScore
                    if score_difference > 0:
                        wins += 1
                    else:
                        losses += 1
                
                user_profile = user.profile
                win_rate = round((wins / total_games * 100), 2) if total_games > 0 else 0
                rankings.append({
                    'user_id': player_id,
                    'username': user.username,
                    'profile_image': user_profile.profile_image.url if user_profile.profile_image else None,
                    'total_games': total_games,
                    'wins': wins,
                    'losses': losses,
                    'win_rate': win_rate
                })
            except (User.DoesNotExist, AttributeError):
                continue

        rankings.sort(key=lambda x: (x['wins'], x['win_rate']), reverse=True)
        
        for index, rank_entry in enumerate(rankings, 1):
            rank_entry['rank'] = index
        
        response_data = []
        # Only consider current user if they are active
        try:
            User.objects.get(id=current_user_id, is_active=True)
            current_user_data = next((rank for rank in rankings 
                                    if rank['user_id'] == int(current_user_id)), None)
        except User.DoesNotExist:
            current_user_data = None
            
        if not current_user_data:
            response_data.extend(rankings[:5])
        else:
            current_user_rank = current_user_data['rank']
            
            if current_user_rank <= 5:
                response_data.extend(rankings[:5])
            else:
                # If user is not in top 5, return top 4 + current user
                top_users = [rank for rank in rankings[:4]]
                response_data.extend(top_users)
                response_data.append(current_user_data)
        
        return Response(response_data, status=status.HTTP_200_OK)