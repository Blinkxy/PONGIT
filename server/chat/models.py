from django.db import models
from django.contrib.auth.models import User

class Room(models.Model):
    room_name = models.CharField(max_length=40, unique=True)
    def __str__(self):
        return self.room_name

class Message(models.Model):
    room = models.ForeignKey(Room,default=False, on_delete=models.CASCADE, related_name='messages')  
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User,default=False, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        # Ensures the newest messages are listed first when querying.
        ordering = ['-timestamp']

    def __str__(self):
        # String representation of the message, useful in admin and debugging.
        return f'Message from {self.sender} to {self.recipient} at {self.timestamp}'
