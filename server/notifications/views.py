from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Notification , Invitation
from .serializers import NotificationSerializer , InvitationSerializer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_notifications(request):
#     """Get all notifications for the current user."""
#     notifications = Notification.objects.filter(recipient=request.user)
#     serializer = NotificationSerializer(notifications, many=True)
#     return Response(serializer.data)

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def mark_as_read(request, notification_id):
#     """Mark a notification as read."""
#     try:
#         notification = Notification.objects.get(
#             id=notification_id,
#             recipient=request.user
#         )
#         notification.read = True
#         notification.save()
#         return Response({"message": "Notification marked as read"})
#     except Notification.DoesNotExist:
#         return Response(
#             {"error": "Notification not found"},
#             status=status.HTTP_404_NOT_FOUND
#         )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    notifications = Notification.objects.filter( recipient=request.user )
    serializer = NotificationSerializer( notifications, many=True )
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_invitation(request):
    invitations = Invitation.objects.filter( recipient=request.user )
    serializer = InvitationSerializer( invitations, many=True )
    return Response(serializer.data)

# @api_view(['DELETE'])
# @permission_classes([IsAuthenticated])
# def delete_notifactions( request ):
#     notifications = Notification.objects.filter(recipient=request.user)