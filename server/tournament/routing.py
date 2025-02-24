from django.urls import path
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/tournament/notifications/$', consumers.TournamentInvitationConsumer.as_asgi()),
    re_path(r'ws/tournament/lobby/(?P<tournament_id>\d+)/$', consumers.TournamentLobbyConsumer.as_asgi()),
    re_path(r'ws/tournament/(?P<tournament_id>\d+)/round/(?P<round_number>\d+)/$', consumers.TournamentRoundConsumer.as_asgi()),
]