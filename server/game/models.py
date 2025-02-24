from django.db import models
# from server.models import UserProfile
from django.contrib.auth.models import User
# import datetime
from datetime import datetime
class History( models.Model ):
    player          =   models.ForeignKey( User, on_delete = models.CASCADE, related_name='player1_histories' ,null=True ) 
    # opponent        =   models.ForeignKey( User, on_delete = models.CASCADE, related_name='player2_histories' ,null=True )
    opponent        =   models.IntegerField( null=False, default=0 )
    session_name    =   models.CharField( max_length=100 , null=False, default="session_game" ) 
    playerScore     =   models.IntegerField( null=False, default=0 )
    opponentScore   =   models.IntegerField( null=False, default=0 )
    # time_game       =   models.TimeField( null=True )
    date_game       =   models.DateTimeField( default=datetime.now )
    # def __str__(self):
    #     return self.sessin_name
# Create your models here.
