from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from server.models import UserProfile
from rest_framework import status

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    user = request.user
    profile, _ = UserProfile.objects.get_or_create(user=user)
    formatted_date = user.date_joined.strftime('%d/%m/%Y')
    return Response({
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "profile_image": user.profile.profile_image.url,
        "joined_at": "joined: " + formatted_date,
    }, status=status.HTTP_200_OK)

