from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import AccessToken
import json
import redis

redis_client = redis.Redis(host='10.11.4.4', port=6379, db=0)

class UserConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        try:
            # Get token from query string
            token = self.scope['query_string'].decode('utf-8').split('=')[1]
            
            # Validate token and get user
            token_obj = AccessToken(token)
            user_id = token_obj['user_id']
            self.user = await self.get_user(user_id)
            
            if self.user:
                # Create a unique room name for this user
                self.room_name = f"user_{self.user.id}"
                
                # Store user's connection in Redis with WebSocket channel name
                await self.store_user_connection()
                
                # Join user's personal room
                await self.channel_layer.group_add(
                    self.room_name,
                    self.channel_name
                )
                await self.accept()
            else:
                await self.close()
        except Exception as e:
            print(f"Connection error: {e}")
            await self.close()
    
    async def disconnect(self, close_code):
        if hasattr(self, 'user'):
            # Remove user's connection from Redis
            await self.remove_user_connection()
            
            # Remove from personal room
            if hasattr(self, 'room_name'):
                await self.channel_layer.group_discard(
                    self.room_name,
                    self.channel_name
                )
    
    @database_sync_to_async
    def store_user_connection(self):
        redis_client.hset(
            "connected_users",
            str(self.user.id),
            json.dumps({
                'username': self.user.username,
                'channel_name': self.channel_name
            })
        )
    
    @database_sync_to_async
    def remove_user_connection(self):
        redis_client.hdel("connected_users", str(self.user.id))
    
    async def friend_request(self, event):
        """
        Handle friend request notifications
        """
        await self.send_json({
            'type': 'friend_request',
            'from_user': event['from_user'],
            'message': event['message']
        })

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None