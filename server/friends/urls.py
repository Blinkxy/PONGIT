from django.urls import path
from . import views

urlpatterns = [
    path('add/<str:friend_username>', views.AddFriendView, name='add_friend'),
    path('remove/<str:friend_username>', views.RemoveFriendView, name='remove_friend'),
    path('list', views.ListFriendsView, name='list_friends'),
    path('block/<str:friend_username>', views.BlockFriendView, name='block_friend'),
    path('list/blocked', views.ListBlockedFriendsView, name='list_blocked_friends'),
    path('accept/<int:friend_id>', views.AcceptFriendRequestView, name='accept_friend'),
    path('pending', views.ListPendingFriendRequestsView, name='list_pending_requests'),
    path('unblock/<str:friend_username>', views.RemoveFriendView, name='remove_friend'),
    path('requests/list', views.SentRequestsView, name='sent_friend_requests'),
    path('requests/cancel/<int:request_id>', views.CancelRequestView, name='cancel_friend_request'),
]