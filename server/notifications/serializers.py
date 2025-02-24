from rest_framework import serializers
from .models import Notification, Invitation

class NotificationSerializer(serializers.ModelSerializer):
    # sender_username = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [ 'recipient', 'sender', 'message', 'typeNotify' ]
        # fields = ['id', 'notification_type', 'title', 'message', 'read', 
        #          'created_at', 'sender_username', 'data']

    def get_sender_username(self, obj):
        return obj.sender.username if obj.sender else None


class InvitationSerializer(serializers.ModelSerializer):
    class Meta:
        model   =   Invitation
        fields  =   [ 'recipient', 'sender', 'message', 'status', 'typeNotify' ]