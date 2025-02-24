from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Friendship, User
from .serializers import FriendshipSerializer
from server.models import UserProfile
from django.http import Http404
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import json
from .redis_client import redis_client 
from django.utils import timezone
from datetime import timedelta

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def AddFriendView(request, friend_username):
    friend = get_object_or_404(User, username=friend_username)
    if request.user == friend:
        return Response(
            {"detail": "You cannot send a friend request to yourself."},
            status=status.HTTP_400_BAD_REQUEST
        )

    existing_friendship = Friendship.objects.filter(
        Q(user=request.user, friend=friend) | Q(user=friend, friend=request.user)
    ).first()

    if existing_friendship:
        if existing_friendship.status == Friendship.BLOCKED:
            return Response(
                {"detail": "Unable to send friend request."},  # Vague message for privacy/security
                status=status.HTTP_400_BAD_REQUEST
            )
        if existing_friendship.status == Friendship.ACCEPTED:
            # Send notification to both users that they are now friends
            redis_key = f"connected_users"
            channel_layer = get_channel_layer()
            
            # Notify the original requester
            requester_connection = redis_client.hget(redis_key, str(existing_friendship.user.id))
            if requester_connection:
                async_to_sync(channel_layer.group_send)(
                    f"user_{existing_friendship.user.id}",
                    {
                        "type": "friend_request_accepted",
                        "from_user": request.user.username,
                        "message": f"{request.user.username} accepted your friend request!"
                    }
                )
            
            return Response(
                {"detail": "You are already friends."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if existing_friendship.status == Friendship.PENDING:
            # Check who sent the request
            if existing_friendship.user == request.user:
                return Response(
                    {"detail": "You have already sent a friend request to this user."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            else:
                # Update friendship status to accepted
                existing_friendship.status = Friendship.ACCEPTED
                existing_friendship.save()
                
                # Send notification to the original requester about acceptance
                redis_key = f"connected_users"
                requester_connection = redis_client.hget(redis_key, str(existing_friendship.user.id))
                if requester_connection:
                    channel_layer = get_channel_layer()
                    async_to_sync(channel_layer.group_send)(
                        f"user_{existing_friendship.user.id}",
                        {
                            "type": "friend_request_accepted",
                            "from_user": request.user.username,
                            "message": f"{request.user.username} accepted your friend request!"
                        }
                    )
                
                return Response(
                    {"detail": "Friend request accepted successfully."},
                    status=status.HTTP_200_OK
                )

    Friendship.objects.create(
        user=request.user,
        friend=friend,
        status=Friendship.PENDING
    )
    redis_key = f"connected_users"
    target_user_connection = redis_client.hget(redis_key, str(friend.id))
    if target_user_connection:
        # Retrieve channel layer
        channel_layer = get_channel_layer()
        target_connection = json.loads(target_user_connection)
        async_to_sync(channel_layer.group_send)(
            f"user_{friend.id}",
            {
                "type": "friend_request",
                "from_user": request.user.username,
                "message": "You have a new friend request."
            }
        )

    return Response(
        {"detail": "Friend request sent successfully."},
        status=status.HTTP_200_OK
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def SentRequestsView(request):
    sent_requests = Friendship.objects.filter(
        user=request.user,
        status=Friendship.PENDING
    ).select_related('friend')


    requests_data = []
    for friendship in sent_requests:
        try:
            profile_image = friendship.friend.profile.profile_image.url if friendship.friend.profile.profile_image else None
        except (AttributeError, UserProfile.DoesNotExist):
            profile_image = None
        requests_data.append({
            'id': friendship.id,
            'friend_username': friendship.friend.username,
            'friend_id': friendship.friend.id,
            'created_at': friendship.created_at,
            'status': friendship.status,
            'profile_image': profile_image
        })

    return Response(requests_data, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def CancelRequestView(request, request_id):
    try:
        friendship = get_object_or_404(
            Friendship,
            id=request_id,
            user=request.user,
            status=Friendship.PENDING
        )

        redis_key = f"connected_users"
        target_user_connection = redis_client.hget(redis_key, str(friendship.friend.id))

        if target_user_connection:
            channel_layer = get_channel_layer()
            target_connection = json.loads(target_user_connection)
            async_to_sync(channel_layer.group_send)(
                f"user_{friendship.friend.id}",
                {
                    "type": "friend_request_cancelled",
                    "from_user": request.user.username,
                    "message": "A friend request has been cancelled."
                }
            )

        friendship.delete()
        return Response({
            "detail": "Friend request cancelled successfully."
        }, status=status.HTTP_200_OK)

    except Http404:
        return Response({
            "detail": "Friend request not found or you don't have permission to cancel it."
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            "detail": "An error occurred while cancelling the friend request."
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def AcceptFriendRequestView(request, friend_id):
    try:
        friendship = Friendship.objects.get(
            friend=request.user,
            user__id=friend_id,
            status=Friendship.PENDING
        )

        friendship.status = Friendship.ACCEPTED
        friendship.save()

        return Response({
            "detail": f"You are now friends with {friendship.user.username}."
        }, status=status.HTTP_200_OK)

    except Friendship.DoesNotExist:
        return Response({
            "detail": "No pending friend request found from this user."
        }, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        return Response({
            "detail": "An error occurred while processing the friend request."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def RemoveFriendView(request, friend_username):
    friend = get_object_or_404(User, username=friend_username)

    friendship = Friendship.objects.filter(
        Q(user=request.user, friend=friend) | Q(user=friend, friend=request.user)
    ).first()

    if not friendship:
        return Response({"detail": "No friendship or request found."}, status=status.HTTP_404_NOT_FOUND)

    try:
        friendship.delete()
        return Response({"detail": "Friendship or request removed successfully."}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"detail": f"Unexpected error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ListFriendsView(request):
    request.user.profile.set_online()
    friendships = Friendship.objects.filter(
        (Q(user=request.user, status=Friendship.ACCEPTED) & Q(friend__is_active=True)) |
        (Q(friend=request.user, status=Friendship.ACCEPTED) & Q(user__is_active=True))
    ).select_related('user', 'friend', 'user__profile', 'friend__profile')
    friends = []
    for friendship in friendships:
        if friendship.user == request.user:
            friend = friendship.friend
        else:
            friend = friendship.user
        if friend.is_active:
            try:
                profile = friend.profile
                profile.update_online_status()
                
                profile_image = profile.profile_image.url if profile.profile_image else None
                formatted_date = friend.date_joined.strftime('%d/%m/%Y')
                
                friends.append({
                    'id': friend.id,
                    'friend_username': friend.username,
                    'friendship_id': friendship.id,
                    'created_at': friendship.created_at,
                    'profile_image': profile_image,
                    'is_online': profile.is_online,
                    'joined_at': 'joined: ' + formatted_date,
                })
            except (AttributeError, UserProfile.DoesNotExist):
                continue

    friends.sort(key=lambda x: (not x['is_online'], x['friend_username'].lower()))
    return Response(friends, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ListPendingFriendRequestsView(request):
    pending_requests = Friendship.objects.filter(friend=request.user, status=Friendship.PENDING)
    serializer = FriendshipSerializer(pending_requests, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def BlockFriendView(request, friend_username):
    try:
        friendship = Friendship.objects.get(
            Q(user=request.user, friend__username=friend_username) |
            Q(user__username=friend_username, friend=request.user)
        )

        if friendship.friend == request.user:
            old_user = friendship.user
            friendship.delete()
            friendship = Friendship.objects.create(
                user=request.user,
                friend=old_user,
                status=Friendship.BLOCKED
            )
        else:
            friendship.status = Friendship.BLOCKED
            friendship.save()

        return Response({"message": "Friend has been blocked."}, status=status.HTTP_200_OK)

    except Friendship.DoesNotExist:
        try:
            blocked_user = User.objects.get(username=friend_username)
            Friendship.objects.create(
                user=request.user,
                friend=blocked_user,
                status=Friendship.BLOCKED
            )
            return Response({"message": "User has been blocked."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        return Response({"error": f"Unexpected error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def UnblockFriendView(request, friend_username):
    try:
        friendship = Friendship.objects.get(
            user=request.user,
            friend__username=friend_username,
            status=Friendship.BLOCKED
        )
        friendship.delete()
        return Response({"message": "User has been unblocked."}, status=status.HTTP_200_OK)
    except Friendship.DoesNotExist:
        return Response({"error": "No blocked friendship found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": f"Unexpected error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ListBlockedFriendsView(request):
    blocked_friendships = Friendship.objects.filter(
        user=request.user,
        status=Friendship.BLOCKED
    )

    serializer = FriendshipSerializer(blocked_friendships, many=True)
    return Response(serializer.data)
