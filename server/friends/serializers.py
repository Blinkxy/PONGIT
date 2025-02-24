from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Friendship
from server.models import UserProfile


class FriendshipSerializer(serializers.ModelSerializer):
    friend_username = serializers.CharField(source='friend.username', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    profile_image = serializers.SerializerMethodField()
    friend_profile_image = serializers.SerializerMethodField()

    class Meta:
        model = Friendship
        fields = [
            'id',
            'user',
            'user_username',
            'friend',
            'friend_username',
            'created_at',
            'status',
            'profile_image',
            'friend_profile_image'
        ]
        read_only_fields = ['id', 'created_at', 'status']

    def get_profile_image(self, obj):
        try:
            return obj.user.profile.profile_image.url if obj.user.profile.profile_image else None
        except (UserProfile.DoesNotExist, AttributeError):
            return None

    def get_friend_profile_image(self, obj):
        try:
            return obj.friend.profile.profile_image.url if obj.friend.profile.profile_image else None
        except (UserProfile.DoesNotExist, AttributeError):
            return None

    def to_representation(self, instance):

        representation = super().to_representation(instance)
        request = self.context.get('request')

        if request and request.user:
            if request.user == instance.friend and instance.status != Friendship.BLOCKED:
                representation['friend_username'] = instance.user.username
                representation['friend_profile_image'] = self.get_profile_image(instance)
                representation['profile_image'] = self.get_friend_profile_image(instance)
                representation['friend'] = instance.user.id
                representation['user'] = instance.friend.id

        return representation