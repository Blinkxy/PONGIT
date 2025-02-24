import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User
from channels.db import database_sync_to_async
from .models import Room, Message
from datetime import datetime
from urllib.parse import parse_qs
from asgiref.sync import sync_to_async
# from better_profanity import profanity

from rest_framework_simplejwt.tokens import AccessToken

class ChatConsumer(AsyncWebsocketConsumer):

    @database_sync_to_async
    def get_user_by_username(self, username):
        return User.objects.get(username=username)
      
    @database_sync_to_async
    def get_or_create_room(self, room_name):
        # Retrieve the room if it exists, or create it if it doesn’t
        room, created = Room.objects.get_or_create(room_name=room_name)
        return room

    @database_sync_to_async
    def save_message(self, message_content, sender, recipient, room):
        # Save the message in the database, linking it to the room
        Message.objects.create(
            sender=sender,
            recipient=recipient,
            content=message_content,
            room=room
        )

    @database_sync_to_async
    def get_chat_history(self, room):
        messages = Message.objects.filter(room=room).order_by('timestamp')
        return [
            {
                "content": msg.content,
                "sender": msg.sender.username,
                "timestamp": msg.timestamp.strftime("%H:%M %b %d")
            }
            for msg in messages
        ]

    async def setup_room_name(self):
        try:
            recipient_username = self.scope["url_route"]["kwargs"]["recipient"]
            
            recipient = await self.get_user_by_username(recipient_username)
            
            user_names = sorted([self.user.username, recipient.username])
            self.room_name = f"{user_names[0]}_{user_names[1]}"
            return True
        except User.DoesNotExist:
            return False

    async def connect(self):
        
        query_string = self.scope['query_string'].decode()  # Decode the query string
        query_params = parse_qs(query_string)  # Parse query string
        token = query_params.get('token', [None])[0]  # Get token value (None if not present)
        # print(token)
        if token:
            try:
                # Verify token
                access_token = AccessToken(token)
                user_id = access_token['user_id']  # Extract user_id from token
                user = await sync_to_async(User.objects.get)(id=user_id)  # Retrieve user from DB
                self.user = user
                # user = self.scope.get('user')
                if not await self.setup_room_name():
                    await self.send(text_data=json.dumps({"error": "Recipient does not exist"}))  # Use send instead of send_json
                    await self.close(4002)
                    return
                # print (f"User: {user} id : {user_id}")
                
                if self.user.is_anonymous:  # Close the connection if the user is not authenticated
                    await self.send(text_data=json.dumps({"error": "User not authenticated"}))  # Use send instead of send_json
                    await self.close(4001)
                    return

                # self.room_name = self.scope['room_name']
                # print("room name is" , self.room_name)
                self.room_group_name = f"chat_{self.room_name}"

                # Retrieve or create the room in the database
                self.room = await self.get_or_create_room(self.room_name)

                self.sender_name = self.user.username
                self.recipient_name = self.scope["url_route"]["kwargs"]["recipient"]
                self.sender = await self.get_user_by_username(self.sender_name)
                self.recipient = await self.get_user_by_username(self.recipient_name)

                # # Join the room group
                await self.channel_layer.group_add(self.room_group_name, self.channel_name)
                await self.accept()
                  
            except Exception as e:
                print(f"Error in WebSocket connect2: {e}")

    async def disconnect(self, close_code):
        pass
        # await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        # Filter bad words
        # profanity.censor_char = '*'
        text_data_json = json.loads(text_data)
        message_content = text_data_json['message']

        # filtered_message = profanity.censor(message_content)

        # message_content = filtered_message

        await self.save_message(message_content,self.sender,self.recipient, self.room)
        print ("MESSAGE: ", message_content)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat.message',
                'user': self.user.username,
                'message': message_content  # Use the message content
            }
        )

    async def chat_message(self, event):
        message_content = event['message']
        sender = event['user'] 
        # Send the full message data to the WebSocket
        await self.send(text_data=json.dumps(
            {
                'message': message_content,
                'sender': sender,
                'timestamp': self.get_current_timestamp()
            }
        ))

    def get_current_timestamp(self):
        return datetime.now().strftime("%H:%M %b %d")
