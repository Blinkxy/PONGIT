from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from server.models import UserProfile
from rest_framework import status
from django.contrib.auth.models import User
import os
from django.conf import settings
from django.core.files.storage import default_storage
from rest_framework import status
from django.http import JsonResponse
from django.core.files.storage import FileSystemStorage
from django.utils import timezone   
from django.core.files import File




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_view(request):
    user = request.user
    profile, _ = UserProfile.objects.get_or_create(user=user)
    return Response({
        "username": user.username,  
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "profile_image": user.profile.profile_image.url,
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def users_view(request):
    users = User.objects.all()
    users_data = []
    formatted_date = user.date_joined.strftime('%d/%m/%Y')
    
    for user in users:
        profile, _ = UserProfile.objects.get_or_create(user=user)
        users_data.append({
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "profile_image": profile.profile_image.url if profile.profile_image else None,
            "joined_at": "joined: " + formatted_date,
        })

    return Response(users_data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def target_user_view(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        profile, _ = UserProfile.objects.get_or_create(user=user)
        user_data = {
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "profile_image": profile.profile_image.url if profile.profile_image else None,
        }
        return Response(user_data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def change_username(request):
    user = request.user
    new_username = request.data.get('new_username')
    new_username = new_username.strip().lower()

    if(user.username == new_username):
        return Response(
            {"error": "New username is the same as the current username."},
            status=status.HTTP_400_BAD_REQUEST
        )
    if not new_username:
        return Response(
            {"error": "New username is required."},
            status=status.HTTP_400_BAD_REQUEST
        )
    if new_username in ['admin', 'root', 'superuser', 'test', 'user', 'username', 'email', 'password', 'signup', 
                        'login', 'logout', 'profile', 'settings', 'account', 'delete', 
                        'deactivate', 'activate', 'update', 'change', 'edit', 
                        'modify', 'reset', 'password', 'userprofile']:
        return Response(
            {"error": "Username not allowed."},
            status=status.HTTP_400_BAD_REQUEST
        )
    if len(new_username) < 4:
        return Response(
            {"error": "Username must be at least 4 characters long."},
            status=status.HTTP_400_BAD_REQUEST
        )
    if len(new_username) > 20:
        return Response(
            {"error": "Username must not exceed 20 characters."},
            status=status.HTTP_400_BAD_REQUEST
        )
    if not new_username.isalnum():
        return Response(
            {"error": "Username must contain only alphanumeric characters."},
            status=status.HTTP_400_BAD_REQUEST
        )
    

    
    if not new_username:
        return Response(
            {"error": "New username is required."},
            status=status.HTTP_400_BAD_REQUEST
        )
    if User.objects.filter(username=new_username).exists():
        return Response(
            {"error": "Username already taken."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user.username = new_username
        user.save()
        return Response(
            {"message": "Username successfully updated.", "new_username": new_username},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )




@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def change_image(request):
    user = request.user
    profile_image = request.FILES.get('image')


    if profile_image:
        ext = os.path.splitext(profile_image.name)[1]
        if ext not in ['.jpg', '.jpeg', '.png']:
            return Response(
                {"error": "Invalid image format. Only .jpg, .jpeg, .png allowed, Newbie!"},
                status=status.HTTP_400_BAD_REQUEST
            )
    if profile_image.size > 2 * 1024 * 1024:
        return Response(
            {"error": "Image file too large. Size should not exceed 2MB. W'ere not a storage company"},
            status=status.HTTP_400_BAD_REQUEST
        )
    try:
        from PIL import Image
        img = Image.open(profile_image)
        img.verify()
    except Exception:
        return Response(
            {"error": "Invalid image file. Please upload a valid image file."},
            status=status.HTTP_400_BAD_REQUEST
        )
    if not profile_image:
        return Response(
            {"error": "Image file is required. Please upload an image file."},
            status=status.HTTP_400_BAD_REQUEST
        )
    try:
        output_dir = os.path.join(settings.MEDIA_ROOT, "images", "modified")

        if not os.path.exists(output_dir):
            os.makedirs(output_dir, exist_ok=True)

        output_image_path = os.path.join(output_dir, f"{user.username}_profile_MOD.jpg")

        file_storage = FileSystemStorage(location=output_dir)
        filename = file_storage.save(f"{user.username}_profile_MOD.jpg", profile_image)

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.profile_image = profile.profile_image = f"images/modified/{filename}"
        profile.save()
        return JsonResponse({
            'status': 'success',
            "message": "Profile image successfully updated",
            "profile_image": profile.profile_image.url
        }, status=status.HTTP_200_OK)
    except AttributeError:
        return JsonResponse({
            'status': 'failed',
            "error": "Profile image field not found. Ensure your User model has a profile with an image field.",
            "profile_image": profile.profile_image.url
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return JsonResponse({
            'status': 'failed',
            "error": f"An error occurred: {str(e)}",
            "profile_image": profile.profile_image.url
        },  status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    user = request.user
    profile, _ = UserProfile.objects.get_or_create(user=user)
    
    try:
        user.username = f"deleted_user_{user.id}"
        user.email = f"deleted_{user.id}@********.***"
        user.first_name = "Deleted"
        user.last_name = "User"
        user.is_active = False
        user.date_deactivated = timezone.now()
        user.save()
        profile.profile_image = f"images/deleted.png"
        profile.save()

        return Response(
            {"detail": "Account successfully deleted."},
            status=status.HTTP_204_NO_CONTENT
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )



from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timedelta
import secrets

class PasswordResetToken:
    @staticmethod
    def generate_token():
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def get_expiry_time():
        return datetime.now() + timedelta(hours=24)

class PasswordResetSerializer:
    def validate_email(self, email):
        try:
            user = User.objects.get(email=email)
            return user
        except User.DoesNotExist:
            return None

@api_view(['POST'])
def request_password_reset(request):

    email = request.data.get('email')
    if not email:
        return Response(
            {"error": "Email is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = PasswordResetSerializer()
    user = serializer.validate_email(email)
    
    if not user:
        return Response(
            {"message": "If an account exists with this email, a password reset link will be sent."},
            status=status.HTTP_200_OK
        )

    token = PasswordResetToken.generate_token()
    expiry = PasswordResetToken.get_expiry_time()
    
    user_profile = UserProfile.objects.get(user=user)
    user_profile.reset_token = token
    user_profile.reset_token_expiry = expiry
    user_profile.save()

    reset_url = f"https://10.11.4.4/resetpassword.html"

    send_mail(
        'Password Reset Request',
        f'Here is your password reset token: {token}\n'
        f'Please go to {reset_url} and enter this token to reset your password.\n'
        f'This token will expire in 24 hours.',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )

    return Response(
        {"message": "Password reset instructions have been sent to your email."},
        status=status.HTTP_200_OK
    )

@api_view(['POST'])
def verify_reset_token(request):
    token = request.data.get('token')
    
    if not token:
        return Response(
            {"error": "Token is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user_profile = UserProfile.objects.get(
            reset_token=token,
            reset_token_expiry__gt=datetime.now()
        )
        return Response(
            {"message": "Token is valid."},
            status=status.HTTP_200_OK
        )
    except UserProfile.DoesNotExist:
        return Response(
            {"error": "Invalid or expired token."},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
def reset_password(request):
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')

    if not all([token, new_password, confirm_password]):
        return Response(
            {"error": "Token and new password are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if new_password != confirm_password:
        return Response(
            {"error": "Passwords do not match."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user_profile = UserProfile.objects.get(
            reset_token=token,
            reset_token_expiry__gt=datetime.now()
        )
        
        user = user_profile.user
        user.set_password(new_password)
        user.save()

        user_profile.reset_token = None
        user_profile.reset_token_expiry = None
        user_profile.save()

        return Response(
            {"message": "Password has been reset successfully."},
            status=status.HTTP_200_OK
        )
    except UserProfile.DoesNotExist:
        return Response(
            {"error": "Invalid or expired token."},
            status=status.HTTP_400_BAD_REQUEST
        )