
from django.conf import settings
from redisConnection import redisPong

class PlayerData():
    def __init__( self, data ):
        self.id = data["id"]
        self.username = data["username"]
        self.state = "waiting"
        self.pos = "l"
        self.connection = data["connection"]
        self.type = data["type"]


class Ball():
    def __init__(self, x , y):
        self.x = x
        self.y = y
        self.width = ballWidth
        self.height = ballHeight
    def updateDirection(self, x, y):
        self.x = x
        self.y = y

class Manager():
    def __init__(self):
        self.Player1 = Player( playerLeftX, playerLeftY )
        self.Player2 = Player( playerRightX, playerRightY )
        self.Ball = Ball( ballX , ballY )
    def updateCordon(self):       
        pass
    def resetGame( self ):
        self.Ball.x = ballX
        self.Ball.y = ballY
    def getData( self ):
        
        player1 = {
            "x"     :self.Player1.x,
            "y"     :self.Player1.y,
            "width" :self.Player1.width,
            "height":self.Player1.height
        }

        player2 = {
            "x"     :self.Player2.x,
            "y"     :self.Player2.y,
            "width" :self.Player2.width,
            "height":self.Player2.height
        }

        ball = {
            "x"     :self.Ball.x,
            "y"     :self.Ball.y,
            "width" :self.Ball.width,
            "height":self.Ball.height
        }
        canva = {
            "w": canvaWidth,
            "h": canvaHeight
        }
        data = {
            "player1" : player1,
            "player2" : player2,
            "ball"    : ball,
            "canva"   : canva
        }
        return data
    def updateData( self, data ):
        # print(data["id"])
        if  data["id"] == 1:
            if  data["key"] == "Up" and outOfRing(self.Player1.y - playerSpeed) == False:
                self.Player1.updateDirection( self.Player1.x, (self.Player1.y - playerSpeed) )
                # self.Player1.y -= playerSpeed
            elif data["key"] == "Down" and outOfRing(self.Player1.y + playerSpeed) == False:
                self.Player1.updateDirection( self.Player1.x, (self.Player1.y + playerSpeed) )
        # elif data["id"] == 2:
        #     if  data["key"] == "Up" and outOfRing(self.Player2.y - playerSpeed) == False:
        #         self.Player2.updateDirection( self.Player2.x, (self.Player2.y - playerSpeed) )
        #         # self.Player2.y -= playerSpeed
        #     elif data["key"] == "Down" and outOfRing(self.Player2.y + playerSpeed) == False:
        #         self.Player2.updateDirection( self.Player2.x, (self.Player2.y + playerSpeed) )
        # if data["id"] == 1 
        pass

    # check coordinates of player is out of canva Height 
# def outOfRing( positionPlayer ):
#     return ( positionPlayer < 0  or positionPlayer + playerHeight > canvaHeight )

    # check ball if Collision of players or not 
# def detectCollision( ball , player ):
#     return ( ball.x < player.x + player.width 
#             and ball.x + ball.width > player.x 
#             and ball.y < player.y + player.height 
#             and ball.y + ball.height > player.y )

class Player():
    def __init__( self , dataPlayer ):
        
        self.x = x
        self.y = y
        self.score = dataPlayer["score"]
        self.width = playerWidth
        self.height = playerHeight
    def updateDirection(self, x, y):
        self.x = x
        self.y = y

class SessionGame():
    def __init__( self, player1, player2 ):
        self.id = {
            "id1"   :   player1["id"],
            "id2"   :   player2["id"]
        }

        self.position = {
            "pos1"  :   player1["position"],
            "pos2"  :   player2["position"]
        }

        self.channel_name = {
            "1"     :   player1["channel_name"],
            "2"     :   player2["channel_name"]
        }

        self.posPlayer = {
            "px1"   :   settings.PLAYERS_ONE_X,
            "py1"   :   settings.PLAYERS_ONE_Y,

            "px2"   :   settings.PLAYERS_TWO_X,
            "py2"   :   settings.PLAYERS_TWO_Y
        }

        self.score = {
            "s1"    :   0,
            "s2"    :   0
        }

        self.canva = {
            "width" :   settings.CANVA_WIDTH,
            "height":   settings.CANVA_HEIGHT
        }
        
    def convertDataToDict( self ):
        data = {
            "id"            :  {
                "1"         : self.id["id1"],
                "2"         : self.id["id2"],
            },

            "position"      :    {
                "1"         : self.position["pos1"],
                "2"         : self.position["pos2"],
            },

            "channel_name"  :   {
                "1"         : self.channel_name["1"],
                "2"         : self.channel_name["2"]
            },

            "posPlayer"     : {
                "1x"        :   self.posPlayer["px1"],
                "1y"        :   self.posPlayer["py1"],
                "2x"        :   self.posPlayer["px2"],
                "2y"        :   self.posPlayer["py2"]
            },

            "score"         :   {
                "1"         :   self.score["s1"],
                "2"         :   self.score["s2"]
            }
        }
        return data

def store_coordinates( session_name , player1 , player2 ):
    redisPong.hset( session_name, mapping={
                f'player_{player1["id"]}_coordinates_x' :   settings.PLAYERS_ONE_X,
                f'player_{player1["id"]}_coordinates_y' :   settings.PLAYERS_ONE_Y,
            }
        )
    redisPong.hset( session_name, mapping={
                f'player_{player2["id"]}_coordinates_x' :   settings.PLAYERS_TWO_X,
                f'player_{player2["id"]}_coordinates_y' :   settings.PLAYERS_TWO_Y,
            }
        )


def store_ball_coordinates( session_name ):
    redisPong.hset( session_name, mapping={
                "ball_x" :   settings.BALL_X,
                "ball_y" :   settings.BALL_Y,
            }
        )


def createSessionGame( player1, player2 ):
    # print( player1 )
    # print( player2 )
    if player1["id"] > player2["id"]:
        session_name = f'session_{player2["id"]}_{player1["id"]}'
    else:
        session_name = f'session_{player1["id"]}_{player2["id"]}'
    redisPong.hset(session_name, mapping={
            f'id_{player1["id"]}'                   :   player1["id"], 
            f'channel_name_{player1["id"]}'         :   player1["channel_name"],
            f'player_{player1["id"]}_side'          :   player1["position"],
            f'score_{player1["id"]}'                :   0
        }
    )
    redisPong.hset(session_name, mapping={
            f'id_{player2["id"]}'                   :   player2["id"], 
            f'channel_name_{player2["id"]}'         :   player2["channel_name"],
            f'player_{player2["id"]}_side'          :   player2["position"],
            f'score_{player2["id"]}'                :   0,
        }
    )
    if player1["position"] == "L" :
        store_coordinates( session_name, player1 , player2 )
    else :
        store_coordinates( session_name, player2, player1 )
    store_ball_coordinates( session_name )

def generateInformationGame( session_name, player1_id , player2_id ):
    dic = {
        "type"              :   "information.game",
        "canvas_w"          :   settings.CANVA_WIDTH,
        "canvas_h"          :   settings.CANVA_HEIGHT,
        "player_w"          :   settings.PLAYER_WIDTH,
        "player_h"          :   settings.PLAYER_HEIGHT,
        "ball_x"            :   settings.BALL_X,
        "ball_y"            :   settings.BALL_Y,
        "ball_w"            :   settings.BALL_WIDTH,
        "ball_h"            :   settings.BALL_HEIGHT,
        "ball_speed"        :   settings.BALL_SPEED_X, 
        "my_id"             :   redisPong.hget( session_name, f'id_{player1_id}'),
        "your_id"           :   redisPong.hget( session_name, f'id_{player2_id}'),
        "my_side"           :   redisPong.hget( session_name, f'player_{player1_id}_side'),
        "your_side"         :   redisPong.hget( session_name, f'player_{player2_id}_side'),
        "my_coordinates_x"  :   redisPong.hget( session_name, f'player_{player1_id}_coordinates_x'),
        "my_coordinates_y"  :   redisPong.hget( session_name, f'player_{player1_id}_coordinates_y'),
        "your_coordinates_x":   redisPong.hget( session_name, f'player_{player2_id}_coordinates_x'),
        "your_coordinates_y":   redisPong.hget( session_name, f'player_{player2_id}_coordinates_y'),
        "my_score"          :   redisPong.hget( session_name, f'score_{player1_id}'),         
        "your_score"        :   redisPong.hget( session_name, f'score_{player2_id}'),   
    }
    return dic     

def outOfRing( positionPlayer ):
    return ( positionPlayer < 0  or positionPlayer + settings.PLAYER_HEIGHT >  settings.CANVA_HEIGHT )

def moveBall( data:dict , left:dict, right:dict ) -> tuple:
    # print(type(data["ball_speed_y"]))
    ballX        :int   =   data["ball_x"]
    ballY        :int   =   data["ball_y"]
    scoreLeft    :int   =   left["score"]
    scoreRight   :int   =   right["score"]
    ball_speed_x :int   =   data["ball_speed_x"]          
    ball_speed_y :int   =   data["ball_speed_y"]          

    ballX += data["ball_speed_x"]
    ballY += data["ball_speed_y"]
    if ballY < 0 or ballY  >= settings.CANVA_HEIGHT:
        data["ball_speed_y"] *= -1  
    # if ballX <= 0 or ballX + settings.BALL_WIDTH >= settings.CANVA_WIDTH:
    #     settings.BALL_SPEED_X *= -1
    if detectCollision( [ballX, ballY], [ left["coordinates_x"],  left["coordinates_y"] ]):
        if ballX <= left["coordinates_x"] + settings.PLAYER_WIDTH:
            data["ball_speed_x"] *= -1
            # settings.BALL_SPEED_X *= -1
    elif detectCollision( [ballX, ballY], [ right["coordinates_x"],  right["coordinates_y"] ]):
        if ballX + settings.BALL_WIDTH >= right["coordinates_x"]:
            data["ball_speed_x"] *= -1

            # settings.BALL_SPEED_X *= -1

    if ballX + settings.BALL_WIDTH <= 0:
        # print("hello in score left")
        scoreRight  +=   1
        ballX       =   settings.BALL_X
        ballY       =   settings.BALL_Y
    
    elif ballX >= settings.CANVA_WIDTH:
        # print("hello in score right")
        scoreLeft +=   1
        ballX       =   settings.BALL_X
        ballY       =   settings.BALL_Y

    return ( ballX, ballY, scoreLeft, scoreRight ,data["ball_speed_x"], data["ball_speed_y"])

def get_data_palyers( session_name:str , idPlayerOne:int, idPlayerTwo:int ) -> dict:
    session_data    :dict   =   redisPong.hgetall( session_name ) 
    dataPlayers     =   {}
    dataPlayers["ball_x"]               =   int( float (session_data[ "ball_x" ] ) )
    dataPlayers["ball_y"]               =   int( float (session_data[ "ball_y" ] ) )

    if session_data[ f'player_{idPlayerOne}_side' ] == "L":
        dataPlayers[ "playerLeftX" ]    =   int( float ( session_data[ f'player_{idPlayerOne}_coordinates_x' ] ) )
        # print("++++DEBUG++++")
        dataPlayers[ "playerLeftY" ]    =   int( float ( session_data[ f'player_{idPlayerOne}_coordinates_y' ] ) )
        dataPlayers[ "scoreLeft" ]      =   int(  ( session_data[ f'score_{idPlayerOne}' ] ) )
        dataPlayers[ "playerRightX" ]   =   int( float ( session_data[ f'player_{idPlayerTwo}_coordinates_x' ] ) )
        dataPlayers[ "playerRightY" ]   =   int( float ( session_data[ f'player_{idPlayerTwo}_coordinates_y' ] ) )
        dataPlayers[ "scoreRight" ]     =   int( float ( session_data[ f'score_{idPlayerTwo}' ] ) )
    else:
        dataPlayers[ "playerLeftX" ]    =   int( float (session_data[ f'player_{idPlayerTwo}_coordinates_x' ] ) )
        dataPlayers[ "playerLeftY" ]    =   int( float (session_data[ f'player_{idPlayerTwo}_coordinates_y' ] ) )
        dataPlayers[ "scoreLeft" ]      =   int(  ( session_data[ f'score_{idPlayerTwo}' ] ) )
        dataPlayers[ "playerRightX" ]   =   int( float (session_data[ f'player_{idPlayerOne}_coordinates_x' ] ) )
        dataPlayers[ "playerRightY" ]   =   int( float (session_data[ f'player_{idPlayerOne}_coordinates_y' ] ) )
        dataPlayers[ "scoreRight" ]     =   int(  ( session_data[ f'score_{idPlayerOne}' ] ) )
    return dataPlayers

def detectCollision( ball:list , player:list ) -> bool:
    return ( ball[0] <= player[0] + settings.PLAYER_WIDTH
            and ball[0] + settings.BALL_WIDTH >= player[0] 
            and ball[1] <= player[1] + settings.PLAYER_HEIGHT 
            and ball[1] + settings.BALL_HEIGHT >= player[1] )

def checkGameEnd( scoreLeft:int, scoreRight:int ) -> bool:
    return scoreLeft == 3 or scoreRight == 3