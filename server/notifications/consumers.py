import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

from urllib.parse import parse_qs
from rest_framework_simplejwt.tokens import AccessToken
from channels.layers import get_channel_layer
from django.contrib.auth.models import User
from asgiref.sync import sync_to_async
from redisConnection import redisPong
from .models import Notification , Invitation

class NotificationConsumer( AsyncWebsocketConsumer ):
    async def connect( self ):
        print("hello world")
        query_string = self.scope['query_string'].decode()  # Decode the query string
        query_params = parse_qs(query_string)  # Parse query string
        if query_params.get("token") == None :
            print(" token is not exist ")
            await self.close()
            return
        try :
            token           =   query_params.get('token')
            access_token    =   AccessToken(token[0])
            user_id         =   access_token['user_id']
            self.user       =   await sync_to_async(User.objects.get)(id=user_id)
            await self.accept()
            self.id = user_id
            await sync_to_async( redisPong.hset )( "connect", self.id, self.channel_name )
            self.room_group_name = "notifications"
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
        except Exception as e :
            print( f"error {e}")
            self.self.room_group_name = None
            await self.close( code=3600 )
    async def notify( self , event ):
        # print(type(event))
        # event_data_json = json.loads( event )
        print( self.id , event["message"] , event["opponentId"] )
        if self.id  == int(event["opponentId"]) and event["type"] == "notify" :
            print(" test message ")
            await self.send( text_data=json.dumps(
                    {
                        "type"      :  "notify",
                        "message"   :   event["message"]
                    }
                )
            )
    
    async def receive( self , text_data ):
        text_data_json = json.loads(text_data)
        print( text_data_json )
        if text_data_json["type"]   ==   "friend" :
            user = await self.get_user( text_data_json["name"] )
            if text_data_json["typeNotify"] == "accept" :
                message = f"{self.user} {text_data_json['typeNotify']} invite"
            elif text_data_json["typeNotify"] == "send" :
                message = f"{self.user} has sent you a friend request!"
            if await sync_to_async( redisPong.exists )( "connect" ) == 1 and await sync_to_async(redisPong.hexists)( "connect",
                 user.id ) == 1:
                await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type'      :   'notify',
                            "id"        :   self.id,
                            "opponentId":   user.id,
                            'message'   :   message
                        }
                    )
            else:
                await self.save_data( {
                    "opponentId"    :   user.id,
                    "message"       :   message,
                    "typeNotify"    :   "message"
                } )
                print(" recipient is not fond ")
        # elif text_data_json["type"] == "notify" :
        #     if await sync_to_async( redisPong.exists )( "connect" ) == 1 and await sync_to_async(redisPong.hexists)( "connect",
        #      text_data_json["opponentId"]) == 1:
        #         await self.channel_layer.group_send(
        #             self.room_group_name,
        #             {
        #                 'type'      :   'notify',
        #                 "id"        :   text_data_json["id"],
        #                 "opponentId":   text_data_json["opponentId"],
        #                 'message'   :   text_data_json["message"]
        #             }
        #         )
        #     else :
        #         text_data_json["typeNotify"] = "message"
        #         await self.save_data( text_data_json )
            print(" recipient is not fond ")
        elif text_data_json["type"] == "remove_data_notify":
            await self.delete_data( self.id )
        elif text_data_json["type"] == "invite_game":
            message = f"{self.user} has invited you to join the game"
            if await sync_to_async( redisPong.exists )( "connect" ) == 1 and await sync_to_async(redisPong.hexists)( "connect",
             text_data_json["opponentId"]) == 1:
                print("send to friend ")
                await self.channel_layer.group_send(
                            self.room_group_name,
                            {
                                'type'      :   'notify',
                                "id"        :   self.id,
                                "opponentId":   text_data_json["opponentId"],
                                'message'   :   message
                            }
                        )
            else:
                await self.save_data( {
                    "opponentId"    :   text_data_json["opponentId"],
                    "message"       :   message,
                    "typeNotify"    :   "invite-game"
                } )
            await self.save_invite( text_data_json , message)
            print("player invite game")
        # print(text_data)

    @sync_to_async
    def save_invite( self, data, message ):
        if User.objects.filter( id=data["opponentId"] ).exists():
            user    =   User.objects.get( id=data["opponentId"] ) 
            Invitation.objects.create( recipient=user, sender=self.user,
                 message=message, status="Pending")
            print( data )
    
    @sync_to_async
    def get_user( self, name ):
        if User.objects.filter( username=name ).exists():
            return  User.objects.get( username=name )
        return None

    # @sync_to_async 
    # def save_data( self, data ):

    @sync_to_async
    def save_data( self, data ):
        if User.objects.filter( id=data["opponentId"] ).exists():
            user    =   User.objects.get( id=data["opponentId"] ) 
            Notification.objects.create( recipient=user, sender=self.user, 
                    message=data["message"], typeNotify=data["typeNotify"] )
    
    @sync_to_async
    def delete_data( self, id_user ):
        if Notification.objects.filter( recipient_id=id_user ).exists(): 
            # notify = Notification.objects.get( recipient_id=id_user )
            notify  =   Notification.objects.filter( recipient_id=id_user )
            print(notify)
            notify.delete()
            print("text is here")
    

    async def disconnect( self, close_code ):
        if close_code != 3600 and self.self.room_group_name != None:
            await self.channel_layer.group_discard( self.room_group_name, self.channel_name )
            print("discrad user")
            if await sync_to_async( redisPong.exists )( "connect" ) == 1:
                await sync_to_async( redisPong.hdel )( "connect", self.id )
                print("remove feild")
        else:
            print("test Notification")



        # token = query_params.get('token', [None])[0]  # Get token value (None if not present)
        # print (f"Token: {token}")
        # if token:
        #     try:
        #         # Verify token
        #         access_token = AccessToken(token)
        #         user_id = access_token['user_id']  # Extract user_id from token
        #         user = await sync_to_async(User.objects.get)(id=user_id)
        #     except Exception as e :
        #         print( " error ", e)
        # else :
        #     print( " not cirrect ")
    # async def connect(self):
    #     print("web spcket connect\n\n")
    #     self.user = self.scope["user"]
    #     if not self.user.is_authenticated:
    #         await self.close()
    #         return

    #     self.room_group_name = f"user_{self.user.id}_notifications"
    #     # redisLog.hset(f"user_{self.user.id}_notifications", 0)
    #     await self.channel_layer.group_add(
    #         self.room_group_name,
    #         self.channel_name
    #     )
    #     await self.accept()

    # async def disconnect(self, close_code):
    #     await self.channel_layer.group_discard(
    #         self.room_group_name,
    #         self.channel_name
    #     )
    # async def read_message(self, event):
    #     if event["id"] == self.user.id :
    #         await self.send(text_data=json.dumps({
    #             'type': 'read_message',
    #             'message': event['message']
    #         }))
    # async def receive(self, text_data):
    #     pass  # Handle any client-to-server messages if needed

    # async def send_notification(self, event):
    #     await self.send(text_data=json.dumps(event['data']))
    
    # async def friend_request_accepted(self, event):
    #     await self.send(text_data=json.dumps({
    #         'type': 'friend_request_accepted',
    #         'from_user': event['from_user'],
    #         'message': event['message']
    #     }))