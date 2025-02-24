from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import UserSerializer
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.decorators import permission_classes, api_view
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
import requests
from django.conf import settings
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import os
from PIL import Image, ImageDraw, ImageFont
from .models import UserProfile
import random
import colorsys
from django.core.mail import send_mail
from .models import User, UserProfile
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
import random
import string
import hashlib
from rest_framework_simplejwt.tokens import OutstandingToken

from .utils import TwoFactorAuth
from celery import shared_task
from django.core.signing import TimestampSigner
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from django.contrib.sites.shortcuts import get_current_site
import threading
from django.http import HttpResponseRedirect
from .models import TwoFactorVerification


def username_encoding(username):
    if not username:
        raise ValueError("Username cannot be empty")

    salt = str(random.randint(2000, 50000000))

    base_hash = hashlib.sha256((salt + username).encode()).hexdigest()

    token_parts = [
        base_hash[:10],
        ''.join(random.choices(username, k=min(5, len(username)))),
        ''.join(random.choices(string.ascii_letters + string.digits, k=5))
    ]

    full_token = ''.join(token_parts)
    token_list = list(full_token)
    random.shuffle(token_list)
    
    return ''.join(token_list)

def generate_profile_image(initials, size=500, letter_size=200):
    image = Image.new('RGB', (size, size), color='white')
    draw = ImageDraw.Draw(image)

    def generate_blue_purple_gradient():
        hue1 = random.uniform(0.6, 0.78)
        hue2 = hue1 + random.uniform(0.05, 0.2)
        
        hue1 = hue1 % 1
        hue2 = hue2 % 1
        rgb1 = [int(x * 255) for x in colorsys.hsv_to_rgb(hue1, 0.7, 0.8)]
        rgb2 = [int(x * 255) for x in colorsys.hsv_to_rgb(hue2, 0.7, 0.8)]

        return tuple(rgb1), tuple(rgb2)
    
    color1, color2 = generate_blue_purple_gradient()
    for y in range(size):
        r = int(color1[0] + (color2[0] - color1[0]) * y / size)
        g = int(color1[1] + (color2[1] - color1[1]) * y / size)
        b = int(color1[2] + (color2[2] - color1[2]) * y / size)

        draw.line([(0, y), (size, y)], fill=(r, g, b))

    try:
        font = ImageFont.truetype(os.path.join(settings.MEDIA_ROOT, "logos", "dejavu-sans", "DejaVuSans-Bold.ttf"), size=letter_size)
    except IOError:
        font = ImageFont.load_default()
    
    text = initials.upper()

    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    position = ((size - text_width) / 2, (size - text_height) / 2)

    luminance = 0.299 * color1[0] + 0.587 * color1[1] + 0.114 * color1[2]
    text_color = (0, 0, 0) if luminance > 128 else (255, 255, 255)

    draw.text(position, text, font=font, fill=text_color)

    return image


def save_image_from_web(image_url, save_path):
    try:
        response = requests.get(image_url, stream=True)
        response.raise_for_status()
        with open(save_path, 'wb') as file:
            for chunk in response.iter_content(chunk_size=8192):
                file.write(chunk)
    except requests.exceptions.RequestException as e:
        Response("Error saving the image, check dak merd dyal internet a m3elem", status=status.HTTP_500_BAD_REQUEST)
        

def add_image_watermark(input_image_path, watermark_image_path, output_image_path, position, watermark_size=None):
    base_image = Image.open(input_image_path)
    watermark = Image.open(watermark_image_path).convert("RGBA")
    if watermark_size:
        watermark = watermark.resize(watermark_size, Image.Resampling.LANCZOS)
    transparent_layer = Image.new("RGBA", base_image.size, (255, 255, 255, 0))
    transparent_layer.paste(watermark, position, mask=watermark)
    watermarked_image = Image.alpha_composite(base_image.convert("RGBA"), transparent_layer)
    watermarked_image.convert("RGB").save(output_image_path, "JPEG")




def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }



@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    totp_code = request.data.get('totp_code')

    if not username or not password:
        return Response(
            {"error": "Username and password are required."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(username=username, password=password)
    if not user:
        return Response(
            {"error": "Invalid credentials."},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    user_profile = UserProfile.objects.get(user=user)
    # if user_profile.ban_login:
    #     return Response(
    #         {"error": "You are banned from logging in, if you think this is a mistake, please contact the admin."},
    #         status=status.HTTP_403_FORBIDDEN
    #     )
    user_profile.ban_login = True
    user_profile.save()

    if user_profile.is_2fa_enabled:
        if not totp_code:
            return Response({
                "requires_2fa": True,
                "user_id": user.id,
                "message": "2FA verification required",
                "qr_code_url": None,
                "totp_secret": None
            }, status=status.HTTP_200_OK)

        if not TwoFactorAuth.verify_totp_code(user_profile.totp_secret, totp_code):
            return Response({
                "error": "Invalid 2FA code"
            }, status=status.HTTP_400_BAD_REQUEST)
    user_profile.set_online()

    tokens = get_tokens_for_user(user)
    serializer = UserSerializer(user)

    return Response({
        "tokens": tokens,
        "user": serializer.data,
        "requires_2fa": user_profile.is_2fa_enabled,
        "is_online": True
    }, status=status.HTTP_200_OK)



@api_view(['POST'])
def validating_2fa(request):
    username = request.data.get('username')
    password = request.data.get('password')
    totp_code = request.data.get('totp_code')

    user = authenticate(username=username, password=password)
    if not user:
        return Response(
            {"error": "Invalid credentials."}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    if not totp_code:
        if user.profile.totp_secret:
            return Response({
                "setup_required": True,
                "user_id": user.id,
                "qr_code_url": None,
                "totp_secret": user.profile.totp_secret,
                "message": "Enter verification code"
            }, status=status.HTTP_200_OK)
        totp_secret = TwoFactorAuth.generate_totp_secret()
        qr_code_url = TwoFactorAuth.generate_qr_code(user.username, totp_secret)
        
        user.profile.totp_secret = totp_secret
        user.profile.save()

        return Response({
            "setup_required": True,
            "user_id": user.id,
            "qr_code_url": qr_code_url,
            "totp_secret": totp_secret,
            "message": "Scan QR code and verify with generated code"
        }, status=status.HTTP_200_OK)

    if not user.profile.totp_secret:
        return Response({
            "error": "2FA setup not initiated"
        }, status=status.HTTP_400_BAD_REQUEST)

    if TwoFactorAuth.verify_totp_code(user.profile.totp_secret, totp_code):
        user.profile.is_2fa_enabled = True
        user.profile.save()
        tokens = get_tokens_for_user(user)
        return Response({
            "tokens": tokens,
            "user": {
                "id": user.id,
                "username": user.username,
                "profile": {
                    "profile_image": user.profile.profile_image.url if user.profile.profile_image else None
                }
            }
        }, status=status.HTTP_200_OK)

    return Response({
        "error": "Invalid verification code"
    }, status=status.HTTP_400_BAD_REQUEST)




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def status_2fa(request):
    user = request.user
    return Response({
        "is_2fa_enabled": user.profile.is_2fa_enabled
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_2fa_verification(request):
    """Request a verification code to be sent via email"""
    user = request.user
    
    code = TwoFactorVerification.generate_code()
    
    TwoFactorVerification.objects.create(
        user=user,
        code=code
    )
    
    send_mail(
        'Two-Factor Authentication Verification Code',
        f'Your verification code is: {code}\nThis code will expire in 2 minutes.',
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )
    
    return Response({
        "message": "Verification code has been sent to your email"
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manage_2fa(request):
    user = request.user
    verification_code = request.data.get('code')
    if not user.profile.is_2fa_enabled:
        user.profile.is_2fa_enabled = True
        user.profile.save()
        send_mail(
            'Two-Factor Authentication Enabled',
            'Two-Factor Authentication has been enabled on your account.',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )

        return Response({
            "message": "2FA has been enabled successfully"
        })

    if not verification_code:
        return Response({
            "error": "Verification code is required to disable 2FA"
        }, status=status.HTTP_400_BAD_REQUEST)

    verification = TwoFactorVerification.objects.filter(
        user=user,
        is_used=False
    ).order_by('-created_at').first()

    if not verification:
        return Response({
            "error": "No verification code found"
        }, status=status.HTTP_400_BAD_REQUEST)

    if verification.is_expired:
        return Response({
            "error": "Verification code has expired"
        }, status=status.HTTP_400_BAD_REQUEST)

    if verification.code != verification_code:
        return Response({
            "error": "Invalid verification code"
        }, status=status.HTTP_401_UNAUTHORIZED)

    verification.is_used = True
    verification.save()

    user.profile.is_2fa_enabled = False
    user.profile.totp_secret = None
    user.profile.save()
    
    return Response({
        "message": "2FA has been disabled successfully"
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cleanup_expired_codes(request):
    expired_time = timezone.now() - timedelta(minutes=2)
    TwoFactorVerification.objects.filter(
        created_at__lt=expired_time,
        is_used=False
    ).delete()
    return Response({"message": "Cleanup completed"})


class EmailThread(threading.Thread):
    def __init__(self, subject, message, from_email, recipient_list):
        self.subject = subject
        self.message = message
        self.from_email = from_email
        self.recipient_list = recipient_list
        threading.Thread.__init__(self)

    def run(self):
        send_mail(
            subject=self.subject,
            message=self.message,
            from_email=self.from_email,
            recipient_list=self.recipient_list,
            fail_silently=False,
        )

@api_view(['POST'])
def signup(request):
    serializer = UserSerializer(data=request.data)
    if request.data.get('username') in ['admin', 'root', 'superuser', 'test', 'user', 'username', 'email', 'password', 'signup', 
                        'login', 'logout', 'profile', 'settings', 'account', 'delete', 
                        'deactivate', 'activate', 'update', 'change', 'edit', 
                        'modify', 'reset', 'password', 'userprofile']:
        return Response(
            {"error": "Username not allowed."},
            status=status.HTTP_400_BAD_REQUEST
        )
    if len(request.data.get('username')) < 3 or len(request.data.get('username')) > 20:
        return Response({
            "error": "Username must be between 3 and 20 characters."
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not request.data.get('username') or not request.data.get('password'):
        return Response({
            "error": "Username and password are required. Please provide your username and password."
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not request.data.get('first_name') or not request.data.get('last_name'):
        return Response({
            "error": "First name and last name are required. Please provide your full name."
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(username=request.data['username']).exists():
        return Response({
            "error": "Username already exists. Please choose a different username."
        }, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(email=request.data['email']).exists():
        return Response({
            "error": "Email already exists. Please choose a different email."
        }, status=status.HTTP_400_BAD_REQUEST)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    if serializer.is_valid():
        user = serializer.save(is_active=False)
        user.set_password(request.data['password'])
        user.save()

        signer = TimestampSigner()
        token = signer.sign(user.email)

        current_site = get_current_site(request)
        verification_url = f"http://{current_site.domain}:8080/email-verification/{token}"

        imagepath = username_encoding(user.username)
        profile_image = generate_profile_image(f"{user.first_name[0]}{user.last_name[0]}")
        profile_image.save(os.path.join(settings.MEDIA_ROOT, "images", "db", f"{imagepath}db.jpg"))
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.profile_image = f"images/db/{imagepath}db.jpg"
        profile.save()

        # Send verification email
        try:
            email_thread = EmailThread(
                subject="Verify your email - Bug free transcendance",
                message=f"""Hi {user.first_name},
Thank you for signing up for our ping pong game. Please verify your email by clicking the link below:

{verification_url}

 This link will expire in 2 minutes.

Best Regards,
The Team""",
from_email=settings.DEFAULT_FROM_EMAIL,
recipient_list=[user.email]
)
            email_thread.start()
        except Exception as e:
            print(f"Error sending email: {e}")
            user.delete()
            return Response({"error": "Failed to send verification email"}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Schedule user deletion if not verified
        delete_unverified_user.apply_async(args=[user.id], countdown=120)

        return Response({
            "message": "Please check your email to verify your account."
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# import render
from django.shortcuts import render


@api_view(['GET'])
def verify_email(request, token):
    try:
        signer = TimestampSigner()
        email = signer.unsign(token, max_age=120) 
        user = User.objects.get(email=email, is_active=False)
        
        user.is_active = True
        user.save()
        
        tokens = get_tokens_for_user(user)

        response = HttpResponseRedirect('http://10.11.4.4:8000/profile')
        response.set_cookie('access_token', tokens['access'])
        response.set_cookie('refresh_token', tokens['refresh'])
        return response
    except:
        return render(request, 'verification_failed.html')


@shared_task
def delete_unverified_user(user_id):
    try:
        user = User.objects.get(id=user_id, is_active=False)
        user.delete()
    except User.DoesNotExist:
        pass 






@api_view(['GET'])
@permission_classes([IsAuthenticated])
def test_token(request):
    user = request.user
    profile, _ = UserProfile.objects.get_or_create(user=user)
    return Response({
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "profile_image": user.profile.profile_image.url,
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)

        user_profile.set_offline()
        user_profile.ban_login = False
        user_profile.save()

        tokens = OutstandingToken.objects.filter(user=request.user)
        for token in tokens:
            try:
                token_obj = RefreshToken(token.token)
                token_obj.blacklist()
            except Exception:
                pass

        return Response({
            "user": {
                "username": request.user.username,
                "id": request.user.id
            },
            "message": "Logged out successfully",
            "is_online": False
        }, status=status.HTTP_200_OK)

    except UserProfile.DoesNotExist:
        return Response({
            "error": "User profile not found"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            "error": "Logout failed",
            "details": str(e)
        }, status=status.HTTP_400_BAD_REQUEST)





@csrf_exempt
@require_http_methods(["GET", "POST"])
def intra_login(request):
    if request.method == "POST":
        try:
            INTRA_CLIENT_ID = settings.INTRA_CLIENT_ID
            INTRA_REDIRECT_URI = settings.INTRA_REDIRECT_URI

            if not INTRA_CLIENT_ID or not INTRA_REDIRECT_URI:
                return JsonResponse({
                    'status': 'error',
                    'message': 'OAuth configuration is missing'
                }, status=500)

            auth_url = (
                f"https://api.intra.42.fr/oauth/authorize?"
                f"client_id={INTRA_CLIENT_ID}&"
                f"redirect_uri={INTRA_REDIRECT_URI}&"
                f"response_type=code"
            )
            return JsonResponse({'status': 'success', 'auth_url': auth_url})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    elif request.method == "GET":
        try:
            code = request.GET.get('code')
            if not code:
                return JsonResponse({'status': 'error', 'message': 'Authorization code not provided'}, status=400)

            token_response = requests.post('https://api.intra.42.fr/oauth/token', data={
                'grant_type': 'authorization_code',
                'client_id': settings.INTRA_CLIENT_ID,
                'client_secret': settings.INTRA_CLIENT_SECRET,
                'code': code,
                'redirect_uri': settings.INTRA_REDIRECT_URI
            })
            if token_response.status_code != 200:
                return JsonResponse({'status': 'error', 'message': 'Failed to retrieve access token'}, status=400)

            access_token = token_response.json().get('access_token')
            if not access_token:
                return JsonResponse({'status': 'error', 'message': 'Invalid token response'}, status=400)

            user_info_response = requests.get('https://api.intra.42.fr/v2/me', 
                                              headers={'Authorization': f'Bearer {access_token}'})

            if user_info_response.status_code != 200:
                return JsonResponse({'status': 'error', 'message': 'Failed to retrieve user info'}, status=400)

            user_info = user_info_response.json()
            username = user_info.get('login', 'unknown')
            if username == "aech-che":
                username = "ROOT"
            
            email = user_info.get('email')
            first_name = user_info.get('first_name', '')
            last_name = user_info.get('last_name', '')
            image_medium = user_info.get('image', '').get('versions').get('medium')

            user, created = User.objects.get_or_create(username=username)
            user.email = email
            user.first_name = first_name
            user.last_name = last_name
            user.save()

            token = get_tokens_for_user(user)
            profile, _ = UserProfile.objects.get_or_create(user=user)
            
            # Update online status
            profile.last_active = timezone.now()
            profile.is_online = True
            
            if not profile.profile_image:
                imagepath = username_encoding(username)
                save_image_from_web(image_medium, "/tmp/42.png")
                add_image_watermark(
                    input_image_path=os.path.join("/tmp", "42.png"),
                    watermark_image_path=os.path.join(settings.MEDIA_ROOT, "logos", "42.png"),
                    output_image_path=os.path.join(settings.MEDIA_ROOT, "images", "intra", f"{imagepath}42.jpg"),
                    position=(15, 15),
                    watermark_size=(90, 90)
                )
                profile.profile_image = f"images/intra/{imagepath}42.jpg"
            
            profile.save()

            request.session['authenticated_user'] = {
                'status': 'success',
                'id': user.id,
                'username': username,
                'token': token,
                'is_2fa_enabled': profile.is_2fa_enabled,
                'profile_image': profile.profile_image.url if profile.profile_image else None,
                'is_online': True
            }

            return JsonResponse({
                'status': 'success',
                'id': user.id,
                'username': username,
                'token': token,
                'is_2fa_enabled': profile.is_2fa_enabled,
                'profile_image': profile.profile_image.url if profile.profile_image else None,
                'is_online': True
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def auth_status(request):
    authenticated_user = request.session.get('authenticated_user') 
    if authenticated_user:
        # Update online status if user is authenticated
        try:
            user = User.objects.get(id=authenticated_user['id'])
            profile = user.profile
            profile.last_active = timezone.now()
            profile.is_online = True
            profile.save(update_fields=['last_active', 'is_online'])
            
            return JsonResponse({
                'status': 'success',
                'id': authenticated_user['id'],
                'username': authenticated_user['username'],
                'token': authenticated_user['token'],
                'is_2fa_enabled': authenticated_user.get('is_2fa_enabled', None),
                'profile_image': authenticated_user.get('profile_image', None),
                'is_online': True
            })
        except (User.DoesNotExist, UserProfile.DoesNotExist):
            pass
            
    return JsonResponse({'status': 'pending'})

@csrf_exempt
@require_http_methods(["GET", "POST"])
def google_login(request):
    if request.method == "POST":
        try:
            GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID
            GOOGLE_REDIRECT_URI = settings.GOOGLE_REDIRECT_URI
            if not GOOGLE_CLIENT_ID or not GOOGLE_REDIRECT_URI:
                return JsonResponse({
                    'status': 'error',
                    'message': 'OAuth configuration is missing'
                }, status=500)

            auth_url = (
                f"https://accounts.google.com/o/oauth2/v2/auth?"
                f"client_id={GOOGLE_CLIENT_ID}&"
                f"redirect_uri={GOOGLE_REDIRECT_URI}&"
                f"response_type=code&"
                f"scope=openid%20email%20profile"
            )

            return JsonResponse({'status': 'success', 'auth_url': auth_url})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    elif request.method == "GET":
        try:
            code = request.GET.get('code')

            if not code:
                return JsonResponse({
                    'status': 'error',
                    'message': 'No authorization code provided'
                }, status=400)

            token_response = requests.post('https://oauth2.googleapis.com/token', data={
                'grant_type': 'authorization_code',
                'client_id': settings.GOOGLE_CLIENT_ID,
                'client_secret': settings.GOOGLE_CLIENT_SECRET,
                'code': code,
                'redirect_uri': settings.GOOGLE_REDIRECT_URI
            })

            token_response.raise_for_status()
            token_data = token_response.json()
            access_token = token_data.get('access_token')

            # Fetch user information from Google
            user_info_response = requests.get(
                'https://openidconnect.googleapis.com/v1/userinfo',
                headers={'Authorization': f'Bearer {access_token}'}
            )
            user_info_response.raise_for_status()
            user_info = user_info_response.json()
            email = user_info.get('email')
            if not email:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Invalid email'
                }, status=400)

            username = email.split('@')[0]
            first_name = user_info.get('given_name', '')
            last_name = user_info.get('family_name', '')
            picture = user_info.get('picture', '')



            user, created = User.objects.get_or_create(email=email)

            if created:
                user.username = username

                user.first_name = first_name
                user.last_name = last_name
                user.save()
            else:
                username = user.username

            token = get_tokens_for_user(user)
            profile, _ = UserProfile.objects.get_or_create(user=user)
            if not profile.profile_image:
                imagepath = username_encoding(username)
                save_image_from_web(picture, "/tmp/google.png")
                add_image_watermark(
                    input_image_path=os.path.join("/tmp", "google.png"),
                    watermark_image_path=os.path.join(settings.MEDIA_ROOT, "logos", "google.png"),
                    output_image_path=os.path.join(settings.MEDIA_ROOT, "images", "google", f"{imagepath}google.jpg"),
                    position=(5, 5),
                    watermark_size=(25, 25)
                )
                profile.profile_image = f"images/google/{imagepath}google.jpg"
                profile.save()

            request.session['authenticated_user'] = {
                'username': username,
                'token': token,
                'id': user.id,
                'profile_image': profile.profile_image.url if profile.profile_image else None
            }

            return JsonResponse({
                'status': 'success',
                'username': username,
                'token': token,
                'profile_image': profile.profile_image.url if profile.profile_image else None
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

from django.http import JsonResponse

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

@csrf_exempt
@require_http_methods(["GET", "POST"])
def check_google_auth_status(request):
    authenticated_user = request.session.get('authenticated_user') 
    if authenticated_user:
        return JsonResponse({
            'status': 'success',
            'id': authenticated_user['id'],
            'username': authenticated_user['username'],
            'token': authenticated_user['token'],
            'profile_image': authenticated_user.get('profile_image', None)
        })
    return JsonResponse({'status': 'pending'})
