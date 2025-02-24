from django.shortcuts import render

# Create your views here.
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Tournament
from .serializers import TournamentSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from .serializers import TournamentPlayerSerializer, TournamentSerializer, TournamentInvitationSerializer
from rest_framework import status
from rest_framework.decorators import api_view
from tournament.models import Tournament, TournamentPlayer


class TournamentCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # Fetch tournaments created by the user
        user = request.user
        print("user", user)
        print("user.id", user.id)
        #check if the user making the request is a player in the tournament
        #check if the user making the request is the owner of the tournament
        if Tournament.objects.filter(created_by=user).exists():
            print("user is the owner of the tournament")
            print("user", user)
            tournament = Tournament.objects.filter(created_by=user).first()
            serializer = TournamentSerializer(tournament)
            return Response(serializer.data, status=200)

        elif TournamentPlayer.objects.filter(player=user).exists():
            print("User is a player in the tournament")
            tournament_player = TournamentPlayer.objects.select_related('tournament').filter(player=user).first()
            tournament = tournament_player.tournament  # Resolve the related tournament
            serializer = TournamentSerializer(tournament)  # Use the Tournament serializer
            return Response(serializer.data, status=200)
        else:
            return Response({'error': 'You do not have a tournament.'}, status=404)
    def post(self, request):
        data = request.data
        data['created_by'] = request.user.id
        data['rounds_num'] = 2
        # Pass the context properly for the serializer
        serializer = TournamentSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print("Validation errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Activate the user's tournament
class ActivateTournament(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        tournament = Tournament.objects.filter(created_by= request.user).first()
        if not tournament:
            return Response({'error': 'You do not have a tournament.'}, status=400)

        # Update tournament status to active
        if tournament.tournament_status != Tournament.STATUS_DRAFT:
            return Response({'error': 'Your tournament is not in draft status.'}, status=400)
        # Update tournament status to active
        tournament.tournament_status = Tournament.STATUS_ACTIVE
        tournament.save()
        # Return the updated tournament data in the response
        serializer = TournamentSerializer(tournament)
        return Response(serializer.data, status=200)

# Delete the user's tournament by the owner
class DeleteTournament(APIView):
    def delete(self, request):
        # Fetch the tournament owned by the user
        tournament = Tournament.objects.filter(created_by=request.user).first()
        if not tournament:
            return Response({'error': 'You do not have a tournament to delete.'}, status=400)
        # Delete the tournament
        try:
            tournament.delete()
            return Response({'message': 'Tournament deleted successfully.'}, status=200)
        except Exception as e:
            return Response({'error': f'Failed to delete the tournament: {str(e)}'}, status=500)


# creating an TournamentInvitation model and triggering a websocket event to the recipient
class SendInvitation(APIView):
    def post(self, request):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=401)
        tournament = Tournament.objects.filter(created_by=request.user).first()
        if not tournament:
            return Response({'error': 'You do not have a tournament.'}, status=400)
        serializer = TournamentInvitationSerializer(data=request.data, context={'request': request, 'tournament': tournament, 'invite_sender': request.user})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        print("Validation errors:", serializer.errors)
        return Response(serializer.errors, status=400)



# fetch round by its number in a tournament 
class FetchRound(APIView):
    def get(self, request, tournament_id, round_number):
        print ("tournament_id", tournament_id)
        tournament = Tournament.objects.filter(id=tournament_id).first()
        if not tournament:
            return Response({'error': 'Tournament not found.'}, status=404)
        print ("round_number", round_number)
        round = tournament.rounds.filter(round_number=round_number).first()
        if not round:
            return Response({'error': 'Round not found.'}, status=404)
        return Response({'round': round_number, 'status': round.round_status}, status=200)

