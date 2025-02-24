# from django.test import TestCase

# # Create your teimport json
# from channels.testing import WebsocketCommunicator
# from channels.layers import get_channel_layer
# from django.contrib.auth.models import User
# from channels.test import ChannelsLiveServerTestCase
# from liveChat import chat

# class ChatConsumerTestCase(ChannelsLiveServerTestCase):

#     def setUp(self):
#         # Create two users for the test
#         self.user1 = User.objects.create_user(username='user1', password='password123')
#         self.user2 = User.objects.create_user(username='user2', password='password123')

#     async def connect_websocket(self, user):
#         # Function to simulate user WebSocket connection
#         communicator = WebsocketCommunicator(application, user=user)
#         connected, subprotocol = await communicator.connect()
#         self.assertTrue(connected)
#         return communicator

#     async def test_chat_message(self):
#         # Simulate WebSocket connection for both users
#         communicator1 = await self.connect_websocket(self.user1)
#         communicator2 = await self.connect_websocket(self.user2)

#         # Assume the room name is dynamically created by the consumer (user1_user2)
#         room_name = f"{self.user1.username}_{self.user2.username}"

#         # Send a message from user1 to user2
#         message = {"message": "Hello, user2!"}
#         await communicator1.send_json_to(message)

#         # Receive message from the communicator2 (simulating user2)
#         response = await communicator2.receive_json_from()

#         # Check that the message was received correctly by user2
#         self.assertEqual(response['message'], "Hello, user2!")

#         # Close the communication
#         await communicator1.disconnect()
#         await communicator2.disconnect()
# sts here.
