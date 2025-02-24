from django.db import models
from django.conf import settings
from django.contrib.auth.models import User

class Notification( models.Model ):
    recipient   =   models.ForeignKey( User, on_delete=models.CASCADE, related_name='notifaction', null=True )
    sender      =   models.CharField( max_length=100 , null=False , default="notification" )
    message     =   models.CharField( max_length=200, null=False, default="notify" )
    typeNotify  =   models.CharField( max_length=100, null=False, default="send" )
    pass

class Invitation( models.Model ):
    recipient   =   models.ForeignKey( User, on_delete=models.CASCADE, related_name='invite', null=True )
    sender      =   models.CharField( max_length=100 , null=False , default="invite" )
    message     =   models.CharField( max_length=200, null=False, default="invite play game" )
    status      =   models.CharField( max_length=100, null=False, default="Pending" )
    typeNotify  =   models.CharField( max_length=100, null=False, default="invite-game" )
# class Notification(models.Model):
#     NOTIFICATION_TYPES = (
#         ('friend_request', 'Friend Request'),
#         ('friend_accept', 'Friend Request Accepted'),
#         ('message', 'New Message'),
#         ('system', 'System Notification')
#     )

#     recipient = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE,
#         related_name='notifications_received'
#     )
#     sender = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE,
#         related_name='notifications_sent',
#         null=True,
#         blank=True
#     )
#     notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
#     title = models.CharField(max_length=255)
#     message = models.TextField()
#     read = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)
#     data = models.JSONField(null=True, blank=True)  # For additional data

#     class Meta:
#         ordering = ['-created_at']