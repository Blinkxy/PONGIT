

import json
import asyncio
from .game import *
from channels.generic.websocket import WebsocketConsumer
from channels.generic.websocket import AsyncWebsocketConsumer
from .game import Manager ,PlayerData , SessionGame

from asgiref.sync import sync_to_async

from redisConnection import redisPong , redisTournament
from channels.layers import get_channel_layer

from django.conf import settings

import time

import os

# import redis

# REDIS_HOST = os.environ.get('REDIS_HOST', 'redis')
# REDIS_PORT = int(os.environ.get('REDIS_PORT', 6379))

# redisPong = redis.Redis(
#     host=REDIS_HOST,
#     port=REDIS_PORT,
#     db=0,
#     decode_responses=True
# )


redisPong.flushdb()
    # token 
from urllib.parse import parse_qs
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import User

from datetime import datetime, timedelta

from game.models import History
# task in connect function

        # self.manage = Manager()
        # self.data = self.manage.getData()
        # self.data["bool"] = 0
        # await self.send(json.dumps(self.data))
        # self.direction_task = asyncio.create_task(self.direction())

# async def direction( self ):
    #     while True:
    #         self.data = self.manage.getData()
    #         self.data["bool"] = 1
    #         await self.send(json.dumps(self.data))
    #         # print("hello world")
    #         await asyncio.sleep(0.0167)

class MatchMakingConsumer( AsyncWebsocketConsumer ):
    async def connect( self ):
        # check user token auth 
            # start
                 # Get token from query parameters
        query_string = self.scope['query_string'].decode()  # Decode the query string
        query_params = parse_qs(query_string)  # Parse query string
        token = query_params.get('token', [None])[0]  # Get token value (None if not present)
        print (f"Token: {token}")
        if token:
            try:
                # Verify token
                access_token = AccessToken(token)
                user_id = access_token['user_id']  # Extract user_id from token
                user = await sync_to_async(User.objects.get)(id=user_id)  # Retrieve user from DB
                print("test test test ")
                self.user = user
                print (f"User: {user} id : {user_id}")
                 
            # end 
                self.roomeName      =   self.scope['url_route']['kwargs']['room_name']
                print(self.roomeName)
                self.id             =   user_id 
                self.type           =   "Waiting"
                if self.user.is_authenticated:
                    print( self.user , self.id )
                    if (await self.checkPlayerExistInWaitingSet( self.id ) == 0 
                                and await self.checkPlayerExistInPlaySet( self.id ) == 0 ):
                        data        =   self.channel_name
                        await   self.addPlayerInWaiting( self.id, data )
                        await   self.accept()
                        await   self.send( text_data=json.dumps( { "type": "waiting" } ) ) # send to player waitting to join players
                        await   self.matchPlayer()
                    else:
                        await self.accept()
                        await self.send( text_data=json.dumps ( {
                            "type"      :   "already_playing",
                            "message"   :   "Player is already playing or waitting",
                            "code"      :   4001  
                        } ) )
                        print("Player is already in the waiting set")
                        await self.close(code=4001)
            except Exception as e:
                print(f"Error in WebSocket connect2: {e}")
            return  
            # await self.accept()
    async def receive( self, text_data ):
        json_data   =  json.loads( text_data )
        if json_data["type"] == "cancel":
            await   self.send( text_data=json.dumps( { "type": "cancel" } ) )
            if json_data["code"] == 4500:
                await self.close( code=4500 )
    async def disconnect( self, close_code ):
        print( "test" , close_code )
        if close_code == 4500:
            if await self.checkPlayerExistInWaitingSet( self.id ) == 1:
                await  sync_to_async( redisPong.srem )( "waiting:random", self.id )
            else:
                print("is not in waiting play")


    @sync_to_async
    def checkPlayerExistInPlaySet( self, player_id ): 
        return redisPong.sismember( "play", player_id )
    
    @sync_to_async
    def checkPlayerExistInWaitingSet( self, player_id ):
        return redisPong.sismember( "waiting:random", player_id )
    
    @sync_to_async
    def addPlayerInWaiting( self, player_id, data ):
        check = 0
        while check < 2:
            with redisPong.pipeline() as pipe:
                try:
                    pipe.watch("waiting:random")
                    if not redisPong.sismember("waiting:random", player_id):
                        pipe.multi()
                        pipe.sadd("waiting:random", player_id)
                        pipe.lpush(f"waiting:{player_id}", data)
                        pipe.execute()
                        
                        break  
                    else:
                        print("Player already exists in the set, exiting...")
                        break
                except redis.WatchError:
                    check += 1
                    print("WatchError: Conflict detected, retrying...")
                    # await asyncio.sleep(0.1)
    
    async def player_session( self, event ):
        await self.send( text_data=json.dumps(
                                                {
                                                    "type"          :   "session_name",
                                                    "my_id"         :   event["myId"],
                                                    "your_id"       :   event["yourId"],
                                                    "session_name"  :   event["session_name"]                   
                                                }
                                            ) )
    
    async def sendSessionIdToPlayer( self, channel_name, player_id1, player_id2, session_name ):
        channel_layer = get_channel_layer()
        await channel_layer.send( channel_name ,
                                                {
                                                    "type"          :   "player.session",
                                                    "myId"          :   player_id1,
                                                    "yourId"        :   player_id2,
                                                    "session_name"  :   session_name
                                                } 
                                            )
    
    async def matchPlayer( self ):
        if redisPong.scard("waiting:random") == 2:
            player_id1  =   await sync_to_async(redisPong.spop)("waiting:random")
            player_id2  =   await sync_to_async(redisPong.spop)("waiting:random")

                    # channel name
            player_1    =   await sync_to_async(redisPong.lpop)(f"waiting:{player_id1}")
            player_2    =   await sync_to_async(redisPong.lpop)(f"waiting:{player_id2}")
            print(player_id1 , player_id2)
                # players id 
            if player_id1 > player_id2:
                session_name = f'session_{player_id2}_{player_id1}'
            else:
                session_name = f'session_{player_id1}_{player_id2}'

            await self.sendSessionIdToPlayer( player_1, player_id1, player_id2, session_name )
            await self.sendSessionIdToPlayer( player_2, player_id2, player_id1, session_name  )
            print("hello world")

# Error during connect: Invalid input of type: 'NoneType'. Convert to a bytes, string, int or float first.
# WebSocket REJECT /ws/game/session_15_16/ [10.11.4.4:62445]
# WebSocket DISCONNECT /ws/game/session_15_16/ [10.11.4.4:62445]
# Error during disconnect: 'GameConsumer' object has no attribute 'roomeName'
# code is -------> :  1006





class GameConsumer( AsyncWebsocketConsumer ):
    async def connect(self):
        query_string = self.scope['query_string'].decode()  # Decode the query string
        query_params = parse_qs(query_string)  # Parse query string
        token = query_params.get('token', [None])[0]  # Get token value (None if not present)
        self.idMatch    =   f"{query_params.get('id')[0]}:player_channels"

        self.typeGame   =   query_params.get('type')[0]
        print("query string is --<>" , self.idMatch , self.typeGame )
        print("test test test ")
        print (f"Token: {token}")
        if token:
            try:
                # Verify token
                access_token = AccessToken(token)
                user_id = access_token['user_id']  # Extract user_id from token
                user = await sync_to_async(User.objects.get)(id=user_id)  # Retrieve user from DB
                self.user = user
                print (f"User: {user} id : {user_id}")

                self.user            =   self.scope["user"]
                self.id              =   user_id
                self.task            =  None
                # self.id              =   self.user.id
                self.username        =   self.user.username
                print( "check error type" ,self.id )
                if await self.checkPlayerExistInPlaySet( self.id ) == 0:
                    self.roomeName       =   self.scope['url_route']['kwargs']['room_name']
                    self.room_group_name =  f"group_{self.roomeName}"
                    await sync_to_async(redisPong.sadd)( "play", self.id )
                    await self.accept()
                    await self.channel_layer.group_add( self.room_group_name, self.channel_name )
                    await self.send( text_data=json.dumps(
                                {
                                    "type": "color_paddel",                    
                                }
                            ))
                    self.state   =   "color"
                else:
                    await self.accept()
                    self.roomeName = None
                    await self.send(text_data=json.dumps({
                        "type"      :   "play",
                        "message"   :   "Player is already playing",
                        "code"      :   4001  
                    }))
                    print("player alrady play")
                    await self.close( code=4500 )
            except Exception as e:
                print(f"Error during connect: {e}")
                await self.close( code=4000 )
    async def   move_player( self, event ):
        # print( type(event["new_position"]))
        new_position    =   json.dumps(event["new_position"])
        await self.send(  text_data=json.dumps(
                                                    {
                                                        "type"          :   "move_player",
                                                        "side"          :   self.side,
                                                        "pos"           :   event["side"],
                                                        "new_position"  :   new_position
                                                    }
                                                )
        )
    async def   information_game( self, event ):
            # convert str to json data 
        left    =   json.loads(event["left"])
        right   =   json.loads(event["right"])
        data    =   json.loads(event["data"])
        if self.side    ==  "left":
            self.your_side  =   "right"
        else :
            self.your_side  =   "left"
        await self.send( text_data=json.dumps(
                                                {
                                                    "type"              :   "information_game",
                                                    "side"              :   self.side,
                                                    # "your_side"         :   self.your_side,
                                                    "left"              :   {
                                                        "id"            :   left["id"],
                                                        "coordinates_x" :   left["coordinates_x"],
                                                        "coordinates_y" :   left["coordinates_y"],
                                                        "color"         :   left["color"]
                                                    },
                                                    "right"              :   {
                                                        "id"            :   right["id"],
                                                        "coordinates_x" :   right["coordinates_x"],
                                                        "coordinates_y" :   right["coordinates_y"],
                                                        "color"         :   right["color"]
                                                    },
                                                    "data"              :   data               
                                                }
                        ) )
    # async def   end_game( self, event ):
    #     print(event)
    #     await   self.send( text_data = json.dumps(event) )
    async def   new_data( self, event ):
        # print(event["left"])
        left    :dict   =   json.loads( event["left"] )
        right   :dict   =   json.loads( event["right"] )
        data    :dict   =   json.loads( event["data"] )
        # if self.side    ==  "left":
        #     self.your_side  =   "right"
        # else :
        #     self.your_side  =   "left"
        await   self.send(text_data=json.dumps(
                                                {
                                                    "type"      :   "newData",
                                                    "left"      :   left["score"],
                                                    "right"     :   right["score"],
                                                    "ball_x"    :   data["ball_x"],                   
                                                    "ball_y"    :   data["ball_y"],  
                                                    "reset"     :   data["reset"],
                                                    "side"      :   self.side                 
                                                }
                                            ))
    async def   close_socket( self, event ):
        data    =   json.dumps(event)
        # print(data)
        # print ( type(event["message"]) )
        await self.send( text_data = json.dumps( event["message"] ) )
        close_code =   event.get('code', 1000)
        # message    =    
        if close_code == 4200:
            await self.save_data( event["message"] )
            pass
        await   self.close( close_code )
        pass
    @sync_to_async
    def save_data( self, data ):
        playerLeft       =   User.objects.get(id=data["left"])
        playerRight      =   User.objects.get(id=data["right"]) 
        History.objects.create( player=playerLeft, opponent=int(data["right"]), session_name=self.roomeName,
            playerScore=data["score"]["left"], opponentScore=data["score"]["right"], date_game=data["date"]  )
        
        History.objects.create( player=playerRight, opponent=int(data["left"]), session_name=self.roomeName,
            playerScore=data["score"]["right"], opponentScore=data["score"]["left"], date_game=data["date"]  )

    async def closed_friend( self, event ):
        # data    =   json.dumps(event)
        print(type(event))
        if event["id"] == self.id:
            print("test close player game ")
            # await sync_to_async( redisPong.srem )( "play", self.id )
            leftEnd             =   json.loads(await  sync_to_async( redisPong.hget )( self.roomeName, "left" ))
            rightEnd            =   json.loads(await  sync_to_async( redisPong.hget )( self.roomeName, "right" ))
            dateTime    :dict   =   json.loads(await sync_to_async( redisPong.hget )( self.roomeName, "date_time" )) 
            channel_layer = get_channel_layer()
            channels_winner = None
            print(type(leftEnd))
            channelLeft     =   leftEnd["channel_name"]
            channelRight    =   rightEnd["channel_name"]
            if int(leftEnd["id"]) == self.id :
                print("game is over close1")
                message   :dict =   {
                                        "type"          :   "end.game",
                                        "type_game"     :    self.typeGame,
                                        "score"         : {
                                                                "left"     :    0,
                                                                "right"    :    3,
                                                           },
                                        "left"          :   leftEnd["id"],
                                        "right"         :   rightEnd["id"],
                                        "date"          :   dateTime["date"],
                }
                message["result"]   =   "won"
                if self.typeGame != "random" and self.typeGame != "chat":
                    channels_winner = await sync_to_async(redisTournament.hget)(self.idMatch, rightEnd["id"])
                    messagePingWinner = {
                        "type" : "process_match_results"
                    }
                    await channel_layer.send(channels_winner,messagePingWinner)
                await channel_layer.send( channelRight, {
                    "type"  :   "close_socket",
                    "message"   :   message,
                    "code"  :   4200
                })
                # if event["typeMessage"]  ==   "not_close":
                await channel_layer.send( channelLeft, {
                    "type"  :   "close_so"
                })
            else :
                print("game is over close2")
                # channelLeft     =   leftEnd["channel_name"]
                # channelRight    =   rightEnd["channel_name"]
                message   :dict =   {
                                        "type"          :   "end.game",
                                        "type_game"     :    "random",
                                        "score"         : {
                                                                "left"     :    3,
                                                                "right"    :    0,
                                                           },
                                        "left"          :   leftEnd["id"],
                                        "right"         :   rightEnd["id"],
                                        "date"          :   dateTime["date"],
                }
                message["result"]   =   "won"
                if self.typeGame != "random" and self.typeGame != "chat":
                    channels_winner = await sync_to_async(redisTournament.hget)(self.idMatch, leftEnd["id"])
                    messagePingWinner = {
                        "type" : "process_match_results"
                    }
                    await channel_layer.send(channels_winner,messagePingWinner)
                print("game is over close3")
                await channel_layer.send( channelLeft, {
                        "type"      :   "close_socket",
                        "message"   :  message,
                        "code"      :   4200
                    })
                print("game is over close4")
                await channel_layer.send( channelRight, {
                    "type"  :   "close_so"
                })
            # print()
        # await   self.close( )
    async def close_so( self, event ):
        await self.close(3898)
    async   def   cancel_task( self, event ):
        if self.task != None:
            print("task is canceled")
            self.task.cancel()
    async def   receive( self, text_data ):
        data = json.loads(text_data)
        print("event" , data) 
        # print( self.state )
            # must handle data race in read redis ----> use pipeline 
        # print( data )
        if  data["type"] == "closeGame":
            # leftEnd     =   await  sync_to_async( redisPong.hget )( self.roomeName, "left" ),
            # rightEnd    =   await  sync_to_async( redisPong.hget )( self.roomeName, "right" ),
            
            # print( leftEnd , rightEnd )
            # message   :dict =   {
            #                             "type"          :   "end.game",
            #                             "type_game"     :    "random",
            #                             "score"         : {
            #                                                     "left"     :    left["score"],
            #                                                     "right"    :    right["score"],
            #                                                },
            #                             "left"          :   left["id"],
            #                             "right"         :   right["id"],
            #                             "date"          :   dateTime["date"],
            #     }
            await self.channel_layer.group_send(
                    self.room_group_name,
                                                    {
                                                        'type'  :   'closed_friend',
                                                        "id"    :   self.id,
                                                        "typeMessage"  :   "not_close"
                                                    }
                        )
            await self.channel_layer.group_send(
                    self.room_group_name,
                                                    {
                                                        'type'  :   'cancel_task',
                                                    }
                        )
            # self.task.cancel()
            # self.room_group_name
            # print("close game" , data["code"])
        if data["type"] == "color" and self.state == "color":
            self.state = "start"
            print("\n\nenter in this case\n\n")
            if await self.checkIfSessionCreated( self.roomeName ) == 0:
                self.side = "left"
                    # set for truck game created 
                    # create game and add information for player left side 
                await   sync_to_async( redisPong.sadd )( f"game:created" , self.roomeName ) # you must cleaned in finish game 
                await   sync_to_async( redisPong.hset )( self.roomeName,
                    "left", 
                                                    json.dumps({     
                                                        "id"            :   self.id,
                                                        "color"         :   data["color"],
                                                        "side"          :   self.side,
                                                        "channel_name"  :   self.channel_name,
                                                        "coordinates_x" :   settings.PLAYERS_ONE_X,
                                                        "coordinates_y" :   settings.PLAYERS_ONE_Y,
                                                        "score"         :   0
                                                    })
                        )
                current_time = datetime.now() + timedelta(hours=1)
                await   sync_to_async( redisPong.hset )( self.roomeName ,
                    "date_time",
                                                    json.dumps({
                                                        "date"              :   current_time.strftime("%Y-%m-%d %H:%M:%S"),
                                                    })
                    )
                # print( data )
            else:
                self.side = "right"
                # print( self.side )
                    # add information for right player or second player
                await   sync_to_async(redisPong.hset)( self.roomeName,
                    "right", 
                                                    json.dumps({     
                                                        "id"            :   self.id,
                                                        "color"         :   data["color"],
                                                        "side"          :   self.side,
                                                        "channel_name"  :   self.channel_name,
                                                        "coordinates_x" :   settings.PLAYERS_TWO_X,
                                                        "coordinates_y" :   settings.PLAYERS_TWO_Y,
                                                        "score"         :   0
                                                    })
                        )
                    # add data for game ( ball, canvas, players(w,y))
                await   sync_to_async(redisPong.hset)( self.roomeName, 
                    "data",
                                                    json.dumps({ 
                                                        "ball_x"            :   settings.BALL_X,                   
                                                        "ball_y"            :   settings.BALL_Y,
                                                        "canvas_w"          :   settings.CANVA_WIDTH,                   
                                                        "canvas_h"          :   settings.CANVA_HEIGHT, 
                                                        "player_w"          :   settings.PLAYER_WIDTH,                     
                                                        "player_h"          :   settings.PLAYER_HEIGHT, 
                                                        "ball_w"            :   settings.BALL_WIDTH,                    
                                                        "ball_h"            :   settings.BALL_HEIGHT,
                                                        "ball_speed_x"      :   settings.BALL_SPEED_X,
                                                        "ball_speed_y"      :   settings.BALL_SPEED_Y,
                                                    })
                        )
                
                    # send information game to group for send to client
                await self.channel_layer.group_send(
                    self.room_group_name,
                                                    {
                                                        'type'  :   'information.game',
                                                        'left'  :    await  sync_to_async( redisPong.hget )( self.roomeName, "left" ),
                                                        'right' :    await  sync_to_async( redisPong.hget )( self.roomeName, "right" ),
                                                        "data"  :    await  sync_to_async( redisPong.hget )( self.roomeName, "data" )
                                                    }
                        )
                        # get data from redis for check 
                left        =   json.loads(await sync_to_async( redisPong.hget )( self.roomeName, "left" ))
                right       =   json.loads(await sync_to_async( redisPong.hget )( self.roomeName, "right" ))
                data        =   json.loads(await sync_to_async( redisPong.hget )( self.roomeName, "data" ))
                # print( data )
                # print( right )
                # print( left )
                #     # you must add time after start game
                # print("here")
                # # start game 
                # print("game is created")
        
        elif data["type"] == "move":
            json_data       =   json.loads(await   sync_to_async( redisPong.hget )( self.roomeName, f"{self.side}" ))
            coordinates_y   =    json_data["coordinates_y"]
            if data["key"] == "Up":
                check = await sync_to_async(outOfRing)( json_data["coordinates_y"] - settings.PLAYER_SPEED)
                if  check == False:
                    json_data["coordinates_y"]   =   json_data["coordinates_y"] - settings.PLAYER_SPEED
                    await   sync_to_async(redisPong.hset)( self.roomeName, f"{self.side}" , json.dumps(json_data) )
                    await   self.channel_layer.group_send( self.room_group_name, {
                                                                                    "type"          :   "move.player",
                                                                                    "side"          :   self.side,
                                                                                    "new_position"  :   json_data["coordinates_y"]
                                                                                } )
            elif data["key"] == "Down":
                check = await sync_to_async(outOfRing)( json_data["coordinates_y"] + settings.PLAYER_SPEED)
                if  check == False:
                    json_data["coordinates_y"]   =   json_data["coordinates_y"] + settings.PLAYER_SPEED
                    await   sync_to_async(redisPong.hset)( self.roomeName, f"{self.side}" , json.dumps(json_data) )
                    await   self.channel_layer.group_send( self.room_group_name, {
                                                                                    "type"          :   "move.player",
                                                                                    "side"          :   self.side,
                                                                                    "new_position"  :   json_data["coordinates_y"]
                                                                                } )
        elif data["type"]   ==  "start":
            await sync_to_async( redisPong.sadd )( f"{self.roomeName}:play",self.id )
            if await sync_to_async( redisPong.scard )( f"{self.roomeName}:play" ) == 2:
                print("test test code date game")
                # date    =   datetime.date.today()
                # time    =   datetime.now().time()
                # current_time = datetime.now() + timedelta(hours=1)
                # existing_date =   json.loads( await sync_to_async(redisPong.hget)(self.roomeName, "date_time"))
                # existing_date["date"] = current_time
                # await   sync_to_async( redisPong.hset )( self.roomeName, "date_time", json.dumps(existing_date) )
                current_time = datetime.now() + timedelta(hours=1)

                # Fetch the existing data from Redis
                existing_date = json.loads( await sync_to_async(redisPong.hget)(self.roomeName, "date_time") )
                existing_date["date"] = current_time.strftime("%Y-%m-%d %H:%M:%S")
                await sync_to_async(redisPong.hset)( self.roomeName, "date_time", json.dumps(existing_date) )
                # hour    =   current_time.hour
                # timeNow  =   f"{current_time.hour} : {current_time.minute}"
                # date    =   str(current_time.date())
                # print(timeNow, date)
                # print(type(date))
                # timeNow    =   time.ctime(time.time())
                # print(time)
                # await   sync_to_async( redisPong.hset )( self.roomeName ,
                #     "date_time",
                #                                     json.dumps({
                #                                         "date"              :   current_time.strftime("%Y-%m-%d %H:%M:%S"),
                #                                     })
                #     )
            # print(await sync_to_async( redisPong.scard )( f"{self.roomeName}:play" ))
                await sync_to_async( redisPong.delete )(f"{self.roomeName}:play") # delete check for start game ( REDIS )
                self.task = asyncio.create_task( self.task_manager( self.roomeName ) )
                # print("start")
            pass
    async def task_manager( self, session_name ):
        while True:
            # print( "id" , self.id )
            # print(await sync_to_async( redisPong.scard )( "play" ))
            # if await sync_to_async( redisPong.scard )( "play" ) != 2:
            #     print("test test test 1")
            #     break
            # print("test")
            left     :dict   =   json.loads(await sync_to_async( redisPong.hget )( self.roomeName, "left" ))
            right    :dict   =   json.loads(await sync_to_async( redisPong.hget )( self.roomeName, "right" ))
            data     :dict   =   json.loads(await sync_to_async( redisPong.hget )( self.roomeName, "data" ))

            newData  :tuple  =   await sync_to_async( moveBall )( data, left, right )
            if left["score"] != newData[2] or right["score"] != newData[3]:
                data["reset"]   =   "reset"
            else :
                data["reset"]   =   "none"
            data["ball_x"]   =   newData[0]
            data["ball_y"]   =   newData[1]
            left["score"]    =   newData[2]
            right["score"]   =   newData[3]
            data["ball_speed_x"]    =   newData[4]
            data["ball_speed_y"]    =   newData[5]

            await   sync_to_async( redisPong.hset )( self.roomeName, "data", json.dumps(data) )
            await   sync_to_async( redisPong.hset )( self.roomeName, "left", json.dumps(left ) )
            await   sync_to_async( redisPong.hset )( self.roomeName, "right", json.dumps(right) )
            # print( left["score"] , right["score"] )
            await   self.channel_layer.group_send(  self.room_group_name, {
                                                                            "type"  :   "new.data",
                                                                            "left"  :   json.dumps( left ),
                                                                            "right" :   json.dumps( right ),
                                                                            "data"  :   json.dumps( data )
                                                                        }
            )
            if await sync_to_async( checkGameEnd )( left["score"], right["score"] ) == True :
                dateTime    :dict   =   json.loads(await sync_to_async( redisPong.hget )( self.roomeName, "date_time" )) 
                channelLeft     =   left["channel_name"]
                channelRight    =   right["channel_name"]
                message   :dict =   {
                                        "type"          :   "end.game",
                                        "type_game"     :    "random",
                                        "score"         : {
                                                                "left"     :    left["score"],
                                                                "right"    :    right["score"],
                                                           },
                                        "left"          :   left["id"],
                                        "right"         :   right["id"],
                                        "date"          :   dateTime["date"],
                }
                    # await channel_layer.send( channelLeft , leftMessage )
                    # await channel_layer.send( channelRight , rightMessage )
                leftMessage     =   message.copy()
                rightMessage     =   message.copy()
                channel_layer = get_channel_layer()
                channels_winner = None
                if  left["score"] > right["score"] :
                    # print("here is enter1")
                    leftMessage["result"]   =   "won"
                    rightMessage["result"]  =   "lost"
                    if self.typeGame != "random" and self.typeGame != "chat":
                        channels_winner = await sync_to_async(redisTournament.hget)(self.idMatch, left["id"])
                        messagePingWinner = {
                            "type" : "process_match_results"
                        }
                        await channel_layer.send(channels_winner,messagePingWinner)
                else :
                    leftMessage["result"]   =   "lost"
                    rightMessage["result"]  =   "won"
                    if self.typeGame != "random" and self.typeGame != "chat":
                        channels_winner = await sync_to_async( redisTournament.hget )( self.idMatch, right["id"] )
                        messagePingWinner = {
                            "type" : "process_match_results"
                        }
                        await channel_layer.send(channels_winner,messagePingWinner)
                # print(leftMessage , rightMessage)
                # await channel_layer.send( channelLeft , leftMessage )
                # await channel_layer.send( channelRight , rightMessage )
                await channel_layer.send( channelLeft, {
                    "type"  :   "close_socket",
                    "message"   :  leftMessage,
                    "code"  :   4200
                })
                await channel_layer.send( channelRight, {
                    "type"  :   "close_socket",
                    "message"   :   rightMessage,
                    "code"  :   4100
                })
                print( "game is end thank you for game play")
                self.task.cancel()
                break
            
            # else :
            await asyncio.sleep( 1 / 60 )
    
    async def disconnect( self, close_code ):
        print("close code is " , close_code)
        # if close_code == 3880 :
        #     print("close game force")
        #     await self.channel_layer.group_send(
        #             self.room_group_name,
        #                                             {
        #                                                 'type'  :   'closed_friend',
        #                                                 "id"    :   self.id,
        #                                                 "typeMessage"  :   "close"
        #                                             }
        #                 )
        if close_code == 4500:
            print("player is play now")
            return
            # REMOVE ID FROM KEY PLAY 
        if await sync_to_async( redisPong.exists )( "play" ) == 1:
            if await sync_to_async( redisPong.sismember )( "play", self.id ) == 1:
                await sync_to_async( redisPong.srem )( "play", self.id )
                print("key is exist here", self.id)
        if await sync_to_async( redisPong.exists )( "game:created" ) == 1:
            if await sync_to_async( redisPong.sismember )( "game:created", self.roomeName ) == 1:
                print( await sync_to_async( redisPong.sismember )( "game:created", self.roomeName ) )
                await sync_to_async( redisPong.srem )( "game:created", self.roomeName )
                print("key is exist here", self.roomeName )
        if close_code == 4200 and await sync_to_async( redisPong.exists )( self.roomeName ) == 1:
            await sync_to_async( redisPong.delete )( self.roomeName )
            print(" data game is exist ", self.roomeName )
        else:
            print(" data game not exist ", self.roomeName )
        await self.channel_layer.group_discard( self.room_group_name, self.channel_name )
        pass
        # try:
        #     if self.roomeName:
        #         if await sync_to_async( redisPong.sismember )( f"{self.roomeName}:play" , self.id ) == 1:
        #             await   sync_to_async( redisPong.srem )( f"{self.roomeName}:play", self.id )
        # except Exception as e:
        #     print(f"Error during disconnect: {e}")
        #     await self.close(code=4000)
        # print("code is -------> : " , close_code )

    @sync_to_async
    def checkPlayerExistInPlaySet( self, player_id ):
        # print("test error")
        return redisPong.sismember( "play", player_id )

    @sync_to_async
    def checkIfSessionCreated( self, roomeName ):
        return redisPong.sismember( "game:created", self.roomeName )






# class testConsumer( AsyncWebsocketConsumer ):
#     async def connect(self):
#         self.roomeName       =   self.scope['url_route']['kwargs']['room_name']
#         self.room_group_name =  f"group_{self.roomeName}"
#         print(self.channel_name)
#         self.user            =   self.scope["user"]
#         self.id              =   self.user.id
#         self.username        =   self.user.username
#         await self.accept()
#         await self.send( text_data=json.dumps(
#                     {
#                         "type": "color_paddel",                       
#                     }
#                 ))
#         # self.type           =   "Waiting" 
#         # if self.user.is_authenticated:
#         #     if self.roomeName == "Random":
#         #         data = self.channel_name
#         #         # self.test = None
#         #         redisPong.lpush(f"waiting:{self.user.id}",data)
#         #         redisPong.sadd("waiting:random",self.scope["user"].id)
#         #         print(redisPong.llen("waitingPlayers"))
#         #         await self.accept()
#         #         await self.matchPlayer( self.roomeName )
#         #         await self.send( text_data=json.dumps(
#         #             {
#         #                 "type": "waiting",                       
#         #             }
#         #         ))
#         # else:
#         #     print("not authenticated")
#         #     await self.close()
#         await self.accept()
#         print("connection is open ")

    


#     async   def move_player( self, event ):
#         await self.send( text_data=json.dumps(
#                     {
#                         "type"          :   "move.palyer",
#                         "newPosition"   :   event["newPosition"],
#                         "sender"        :   event["sender"]                     
#                     }
#             ))
    


#     async   def sendMovePlayer( self, newPosition ):
#         print( self.id , self.idYourPlayer , newPosition )
#         key1                =      f'channel_name_{self.idYourPlayer}'
#         key2                =      f'channel_name_{self.id}'
#         your_channel_name   =   await sync_to_async(redisPong.hget)( self.sessionGame, key1  )
#         channel_layer       =   get_channel_layer()
#         await channel_layer.send( your_channel_name ,
#             {
#                 "type"          :   "move.player",
#                 "newPosition"   :   newPosition,
#                 "sender"        :   "p"  
#             }
#         )
#         my_channel_name     =   await   sync_to_async(redisPong.hget)( self.sessionGame, key2 )
#         await channel_layer.send( my_channel_name ,
#             {
#                 "type"          :   "move.player",
#                 "newPosition"   :   newPosition,
#                 "sender"        :   "m"
#             }
#         )
#         pass

    

#     async def receive( self, text_data ):
#         # print(type(text_data))
#         data = json.loads(text_data)
#         # print( self.idYourPlayer , " " , self.id )
#         print(data)
#         # self.sessionGame;
#         if data["type"] == "Random":
#             key = f'player_{self.id}_coordinates_y'
#             self.newPosittion = await  sync_to_async(redisPong.hget)( self.sessionGame, key )
#             print(type(self.newPosittion))
#             if data["key"] == "Up": 
#                 check = await sync_to_async(outOfRing)( float(self.newPosittion) - settings.PLAYER_SPEED)
#                 self.newPosittion = float(self.newPosittion) - settings.PLAYER_SPEED
#                 if check == False:
#                     await   sync_to_async(redisPong.hset)( self.sessionGame, key , self.newPosittion )
#                     await   self.sendMovePlayer( self.newPosittion )
#                     print("new" , self.newPosittion)
#                 else:
#                     print("number is negative")
#             if data["key"] == "Down":
#                 check = await sync_to_async(outOfRing)( float(self.newPosittion) + settings.PLAYER_SPEED)
#                 self.newPosittion = float(self.newPosittion) + settings.PLAYER_SPEED
#                 if check == False:
#                     await  sync_to_async(redisPong.hset)( self.sessionGame, key , self.newPosittion )
#                     await   self.sendMovePlayer( self.newPosittion )
#                     print("new" , self.newPosittion)
#                 pass
#         # self.text_data_json = json.loads(text_data)

#     async def disconnect(self, close_code):
#         roomeName = self.scope['url_route']['kwargs']['room_name']
#         print(roomeName)

#         if roomeName == "Random":
#             print( self.channel_name )
#         print("DISCONNECT web sockets ")
#         pass

#     async def player_id( self, event ):
#         self.idYourPlayer       =   event["yourId"]
#         json_data = json.dumps(
#             {
#                 "type"          :   "id.player",
#                 "myId"          :   event["myId"],
#                 "yourId"        :   event["yourId"]
#             }
#         )
#         await self.send( text_data=json_data )

#         # send id player 
#     async def sendIdPlayer( self, channel_name, id1, id2 ):
#         channel_layer = get_channel_layer()
#         await channel_layer.send( channel_name ,
#             {
#                 "type"  :   "player.id",
#                 "myId"          :   id1,
#                 "yourId"        :   id2
#             }
#         )

#         # match making
    
#     async def save_Session( self,  event ):
#         self.sessionGame = event["session_name"]
    
#     async def matchPlayer( self , roomeName ):
#         print(f"waiting:{self.scope['user'].id}")

#         print(redisPong.llen(f"waiting:{self.scope['user'].id}"))
#         if roomeName == "Random" and redisPong.scard("waiting:random") == 2:
            
#             player_id1  =   await sync_to_async(redisPong.spop)("waiting:random")
#             player_id2  =   await sync_to_async(redisPong.spop)("waiting:random")

#                     # channel name
#             player_1    =   await sync_to_async(redisPong.lpop)(f"waiting:{player_id1}")
#             player_2    =   await sync_to_async(redisPong.lpop)(f"waiting:{player_id2}")
#                 # players id 
#             await self.sendIdPlayer( player_1, player_id1, player_id2 )
#             await self.sendIdPlayer( player_2, player_id2, player_id1 )

#                 # create a session_palyers  

#                 #  data player 1
#             player1 = {
#                 "id"            : player_id1,
#                 "channel_name"  : player_1 ,
#                 "position"      : "L"
#             }
#                 #   data player 2
#             player2 = {
#                 "id"            : player_id2 ,
#                 "channel_name"  : player_2 ,
#                 "position"      : "R"
#             }
#             channel_layer = get_channel_layer()

#                 # send session name 
#             if player_id1 > player_id2:
#                 session_name = f'session_{player_id2}_{player_id1}'
#             else:
#                 session_name = f'session_{player_id1}_{player_id2}'
#             self.sessionGame = session_name
#             await channel_layer.send( player_1 , {
#                 "type"          :   "save.Session",
#                 "session_name"  :   self.sessionGame
#             })
#             await channel_layer.send( player_2 , {
#                 "type"          :   "save.Session",
#                 "session_name"  :  self.sessionGame
#             })
#             await sync_to_async( createSessionGame )( player1, player2 )
#                 # start game
#             await self.sendStartGame( player_id1, player_id2 , session_name )
            


#         # information game before start 
    
#     async def information_game( self , event ):
#         json_data = json.dumps( event )
#         await self.send( text_data=json_data )
    
#     async def sendStartGame( self, player_id1 , player_id2 , session_name ):
#         # self.sessionGame = session_name
#         print(self.sessionGame, session_name)
#         dataSession = redisPong.hgetall( self.sessionGame )

#         channel_nameP1 = await sync_to_async(redisPong.hget)( self.sessionGame, f'channel_name_{player_id1}' ) 
#         channel_nameP2 = await sync_to_async(redisPong.hget)( self.sessionGame, f'channel_name_{player_id2}' )

#         channel_layer = get_channel_layer()

#             # generte information game
#         dataP1 = await sync_to_async( generateInformationGame )( self.sessionGame, player_id1, player_id2 )
        
#         await channel_layer.send( channel_nameP1, dataP1 )
#         dataP2 = await sync_to_async( generateInformationGame )( self.sessionGame, player_id2, player_id1 )
#         print( "my id id " , self.sessionGame )
        
#         await channel_layer.send( channel_nameP2, dataP2 )
        
#         self.type   =   "Start"
#         self.direction_task     =   asyncio.create_task( self.direction( session_name ) )



#     async def move_ball( self , event ):
#         json_data = json.dumps( event )
#         await self.send( text_data=json_data )
#     async def direction( self , session_name ):
#         if  self.type == "Start":
#             session_data     :dict  =   await sync_to_async( redisPong.hgetall )( session_name )
#             channel_nameP1   :str   =   session_data[f'channel_name_{self.id}']                
#             channel_nameP2   :str   =   session_data[f'channel_name_{self.idYourPlayer}']
#             splitSessionname :list  =   session_name.split("_")    
#             idPlayerOne      :int   =   int(splitSessionname[1])  
#             idPlayerTwo      :int   =   int(splitSessionname[2])
#             positionP1       :str   =   session_data[f'player_{self.id}_side']
#             print("player position ", self.id, positionP1)
#         while self.type == "Start":
#             dataSessionGame  :dict   =   await sync_to_async( get_data_palyers )( session_name, idPlayerOne, idPlayerTwo) 
#             ball_score       :tuple  =   await sync_to_async( moveBall )( dataSessionGame )
#             await   sync_to_async(redisPong.hset)( self.sessionGame, "ball_x", ball_score[0] )
#             await   sync_to_async(redisPong.hset)( self.sessionGame, "ball_y", ball_score[1] )
#             print(ball_score[2])
#             print("++++DEBUG++++1") 
#             channel_layer = get_channel_layer()
#             if  positionP1 == "L":
#                 await channel_layer.send( channel_nameP1, {
#                                 "type"      :   "move.ball",
#                                 "ball_x"    :   ball_score[0],
#                                 "ball_y"    :   ball_score[1],
#                                 "myScore"   :   ball_score[2],
#                                 "yourScore" :   ball_score[3],
#                             }
#                 )
#                 await channel_layer.send( channel_nameP2, {
#                                     "type"      :   "move.ball",
#                                     "ball_x"    :   ball_score[0],
#                                     "ball_y"    :   ball_score[1],
#                                     "myScore"   :   ball_score[3],
#                                     "yourScore" :   ball_score[2]
#                                 }
#                 )
#                 await   sync_to_async(redisPong.hset)( self.sessionGame, f'score_{self.id}', ball_score[2] )
#                 await   sync_to_async(redisPong.hset)( self.sessionGame, f'score_{self.idYourPlayer}', ball_score[3] )
#             else :
#                 await channel_layer.send( channel_nameP1, {
#                                 "type"      :   "move.ball",
#                                 "ball_x"    :   ball_score[0],
#                                 "ball_y"    :   ball_score[1],
#                                 "myScore"   :   ball_score[3],
#                                 "yourScore" :   ball_score[2],
#                             }
#                 )
#                 await channel_layer.send( channel_nameP2, {
#                                     "type"      :   "move.ball",
#                                     "ball_x"    :   ball_score[0],
#                                     "ball_y"    :   ball_score[1],
#                                     "myScore"   :   ball_score[2],
#                                     "yourScore" :   ball_score[3],
#                                 }
#                 )
#                 await   sync_to_async(redisPong.hset)( self.sessionGame, f'score_{self.id}', ball_score[3] )
#                 await   sync_to_async(redisPong.hset)( self.sessionGame, f'score_{self.idYourPlayer}', ball_score[2] )
#             print("2++++DEBUG++++")  
#             await   asyncio.sleep( 1 )
#         pass











# "type"          :   "information.game",
                #  "canva"     : {
                #      "w"         :   settings.CANVA_WIDTH,
                #      "h"         :   settings.CANVA_HEIGHT
                #  },
                # "myid"        :     redisPong.hget( ,f'id_{player_id1}')
                # {
                #     "my"        :   data_json["id"]["1"],
                #     "your"      :   data_json["id"]["2"],
                # },
        # }
        # )
        #         "position"  : {
        #             "my"        :   data_json["position"]["1"],
        #             "your"      :   data_json["position"]["2"],
        #         },
        #         "score"     : {
        #             "my"        :   data_json["score"]["1"],
        #             "your"      :   data_json["score"]["2"],
        #         },
        #         "posPlayer"  : {
        #             "myX"       :   data_json["posPlayer"]["1x"],
        #             "myY"       :   data_json["posPlayer"]["1y"],
        #             "yourX"       :   data_json["posPlayer"]["2x"],
        #             "yourY"       :   data_json["posPlayer"]["2y"],
        #         }
        #         # "data"          :   data_json
        #     }
        # )
        # await channel_layer.send( channel_name["2"], {
        #         "type"      :       "information.game",
        #         "canva"     : {
        #             "w"         :   settings.CANVA_WIDTH,
        #             "h"         :   settings.CANVA_HEIGHT
        #         },
        #         "id"        : {
        #             "my"        :   data_json["id"]["2"],
        #             "your"      :   data_json["id"]["1"],
        #         },
        #         "position"  : {
        #             "my"        :   data_json["position"]["2"],
        #             "your"      :   data_json["position"]["1"],
        #         },
        #         "score"     : {
        #             "my"        :   data_json["score"]["2"],
        #             "your"      :   data_json["score"]["1"],
        #         },
        #         "posPlayer"  : {
        #             "myX"       :   data_json["posPlayer"]["2x"],
        #             "myY"       :   data_json["posPlayer"]["2y"],
        #             "yourX"       :   data_json["posPlayer"]["1x"],
        #             "yourY"       :   data_json["posPlayer"]["1y"],
        #         }  
        #         # "data"      :   data_json
        #     }
        # )               