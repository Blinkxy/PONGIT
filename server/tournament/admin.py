from django.contrib import admin
from .models import Tournament, TournamentPlayer, TournamentInvitation, TournamentRound, TournamentMatch, MatchResult

# Register your models here.
admin.site.register(Tournament)
admin.site.register(TournamentPlayer)
admin.site.register(TournamentInvitation)
admin.site.register(TournamentRound)
admin.site.register(TournamentMatch)
admin.site.register(MatchResult)