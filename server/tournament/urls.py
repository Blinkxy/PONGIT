from django.urls import path
from . import views
from .views import TournamentCreateAPIView, ActivateTournament, DeleteTournament, SendInvitation , FetchRound

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView




urlpatterns = [
    path('', TournamentCreateAPIView.as_view(), name='create_tournament'),
    path('activate/', ActivateTournament.as_view(), name='activate_tournament'),
    path('delete/', DeleteTournament.as_view(), name='delete_tournament'),
    path('invitation/', SendInvitation.as_view(), name='send_invitation'),
    path('<int:tournament_id>/round/<int:round_number>/', FetchRound.as_view(), name='fetch_round'),
    # jwt token urls
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),


]