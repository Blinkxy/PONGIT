from .models import Friendship
from django.contrib.auth.models import User

def add_friend(user, friend):
    if user == friend:
        raise ValueError("A user cannot be friends with themselves.")

    Friendship.objects.get_or_create(user=user, friend=friend)
    Friendship.objects.get_or_create(user=friend, friend=user)

def remove_friend(user, friend):
    Friendship.objects.filter(user=user, friend=friend).delete()
    Friendship.objects.filter(user=friend, friend=user).delete()

def are_friends(user, friend):
    return Friendship.objects.filter(user=user, friend=friend).exists()

def get_friends(user):
    friendships = Friendship.objects.filter(user=user)
    return [friendship.friend for friendship in friendships]

def has_pending_request(user1, user2):
    return Friendship.objects.filter(user=user1, friend=user2, status=Friendship.PENDING).exists()
