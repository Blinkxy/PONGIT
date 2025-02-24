"""
ASGI config for server project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

# import os

# from django.core.asgi import get_asgi_application

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')

# application = get_asgi_application()



import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application
from django.urls import path
from django.urls import re_path
# from notifications.routing import websocket_urlpatterns as notification_websocket_urlpatterns

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "server.settings")

# # Initialize Django ASGI application early to ensure the AppRegistry
# # is populated before importing code that may import ORM models.


# from chat.routing import websocket_urlpatterns

import server.routing
import tournament.routing
import game.routing
import notifications.routing
import chat.routing
# from chat.middleware import JWTAuthMiddleware
from chat.routing import websocket_urlpatterns
from game.routing import websocket_urlpatterns
from tournament.routing import websocket_urlpatterns
from notifications.routing import websocket_urlpatterns


django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": get_asgi_application(),  # Handle HTTP requests
    "websocket":
        AuthMiddlewareStack(
            URLRouter(
               notifications.routing.websocket_urlpatterns
               + tournament.routing.websocket_urlpatterns
               + game.routing.websocket_urlpatterns
               + server.routing.websocket_urlpatterns
               + notifications.routing.websocket_urlpatterns
               + chat.routing.websocket_urlpatterns
            )

    ),
})
            #    + server.routing.websocket_urlpatterns


# import os
# from django.core.asgi import get_asgi_application
# from channels.routing import ProtocolTypeRouter, URLRouter
# from channels.auth import AuthMiddlewareStack
# from .routing import websocket_urlpatterns

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')

# application = ProtocolTypeRouter({
#     "http": get_asgi_application(),
#     "websocket": AuthMiddlewareStack(
#         URLRouter(
#             websocket_urlpatterns
#         )
#     ),
# })
