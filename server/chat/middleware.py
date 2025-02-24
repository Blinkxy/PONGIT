import jwt
from django.contrib.auth.models import User
from django.conf import settings
from channels.db import database_sync_to_async


class JWTAuthMiddleware:
    """
    Middleware for handling JWT authentication for WebSocket connections.
    """

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # Extract the token from the query string
        query_string = scope.get("query_string", b"").decode()
        token = self._get_token_from_query_string(query_string)

        # Validate the token and attach the user to the scope
        if token:
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
                user = await self.get_user(payload["user_id"])
                scope["user"] = user
            except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist):
                scope["user"] = None
        else:
            scope["user"] = None

        # Pass the updated scope to the inner application
        return await self.inner(scope, receive, send)

    def _get_token_from_query_string(self, query_string):
        """
        Extract the token from the query string (e.g., ?token=<jwt_token>)
        """
        if "token=" in query_string:
            return query_string.split("token=")[1]
        return None

    @database_sync_to_async
    def get_user(self, user_id):
        """
        Fetch user from the database.
        """
        return User.objects.get(id=user_id)
