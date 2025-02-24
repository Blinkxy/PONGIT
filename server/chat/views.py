from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Message, Room
from django.contrib.auth.models import User 
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_history(request, sender_username, recipient_username):
    # return Response({"chat_history": []}, 200)
    try:
        # Get the authenticated user and the recipient
        
        recipient = User.objects.get(username=recipient_username)

        # Dynamically determine the room name
        user_names = sorted([sender_username, recipient.username])
        room_name = f"{user_names[0]}_{user_names[1]}"

        # Retrieve the room
        room = Room.objects.get(room_name=room_name)

        # Retrieve messages for the room
        messages = Message.objects.filter(room=room).order_by('timestamp')

        # Serialize the messages
        chat_history =[
            {
                "content": msg.content,
                "sender": msg.sender.username,
                "timestamp": msg.timestamp.isoformat()
            }
            for msg in messages
        ]

        return Response({"chat_history": chat_history}, status=200)
    except User.DoesNotExist:
        return Response({"error": "Recipient does not exist"}, status=404)
    except Room.DoesNotExist:
        return Response({"chat_history empty": []}, status=200)  # No room = no messages
    


