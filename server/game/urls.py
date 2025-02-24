from django.urls import path

from . import views


urlpatterns = [
    path("<user_id>/", views.playerHistory, name="playerHistory"),
    path("<user_id>/stats/", views.playerStats, name="playerStats"),
    path("<user_id>/ranks/", views.playerRanks, name="playerRanks"),
    path('<user_id>/my_rank/', views.myRank, name='myRank'),
    path('<current_user_id>/top-ranks/', views.topRanks, name='topRanks'),
    path('<user_id>/last2matches/', views.lastTwoMatchesSimple, name='lastTwoMatchesSimple'),
    path('<user_id>/lastwin/', views.lastWinMatch, name='lastWinMatch'),

]