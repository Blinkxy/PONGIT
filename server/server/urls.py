"""
URL configuration for server project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path, include
from . import views
from django.conf.urls.static import static
from django.conf import settings
from django.http import JsonResponse

def api_base(request):
    return JsonResponse({"message": "You can't find any bug, please validate the project and go back to ur post"}, status=200)
    
def api_base1(request):
    return JsonResponse({"message": "You can't find any bug, please validate the project and go back to ur post"}, status=200)



urlpatterns = [
    path('admin/', admin.site.urls),

    # DB login
    path('login/', views.login, name='login'),
    path('signup/', views.signup, name='signup'),
    path('test_token/', views.test_token, name='test_token'),

    # 42 login
    path('intra-login/', views.intra_login, name='intra_login'),
    path('auth-status/', views.auth_status, name='auth_status'),


    # Google login
    path('auth/google/', views.google_login, name='google_login'),
    path('auth/google/callback/', views.check_google_auth_status, name='check_google_auth_status'),


    # game 
    path("game/", include("game.urls")),

    # tournament
    path("tournament/", include("tournament.urls")),


    # Profile
    path("profile", include("profiles.urls")),

    # User
    path("user", include("user.urls")),


    #protect media
    # re_path(r'^media/(?P<path>.*)$', views.protected_media, name='protected_media'),

    # logout
    path('logout', views.logout_view, name='logout_view'),


    # Friends
    path("friends/", include("friends.urls")),


    # Notifications
    path('notifications/', include('notifications.urls')),

    # 2fa
    path('validating-2fa/', views.validating_2fa, name='validating_2fa'),
    path('2fa/manage', views.manage_2fa, name='2fa-manage'),
    path('2fa/status', views.status_2fa, name='2fa-status'),
    path('2fa/request-verification', views.request_2fa_verification, name='request_2fa_verification'),


    # Chat
    path('chat/', include('chat.urls')),
    # email verification
    path('email-verification/<str:token>/', views.verify_email, name='verify_email'),
    path('playerHistory/',include("game.urls"), name="history")



]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# from django.http import JsonResponse

# def api_base(request):
#     return JsonResponse({"message": "You can't find any bug, please validate the project and go back to ur post"}, status=200)
    
# def api_base1(request):
#     return JsonResponse({"message": "You can't find any bug, please validate the project and go back to ur post"}, status=200)

# urlpatterns = [
#     path('admin/', admin.site.urls),

#     path('', api_base),

#     path('api/', api_base1),
#     # DB login

#     path('api/login/', views.login, name='login'),
#     path('api/signup/', views.signup, name='signup'),
#     path('api/test_token/', views.test_token, name='test_token'),

#     # 42 login
#     path('api/intra-login/', views.intra_login, name='intra_login'),
#     path('api/auth-status/', views.auth_status, name='auth_status'),

#     # Google login
#     path('api/auth/google/', views.google_login, name='google_login'),
#     path('api/auth/google/callback/', views.check_google_auth_status, name='check_google_auth_status'),

#     # Game
#     path("api/game/", include("game.urls")),

#     # Tournament
#     path("api/tournament/", include("tournament.urls")),

#     # Profile
#     path("api/profile/", include("profiles.urls")),

#     # User
#     path("api/user", include("user.urls")),

#     # Logout
#     path('api/logout', views.logout_view, name='logout_view'),

#     # Friends
#     path("api/friends/", include("friends.urls")),

#     # Notifications
#     path('api/notifications/', include('notifications.urls')),

#     # 2FA
#     path('api/validating-2fa/', views.validating_2fa, name='validating_2fa'),
#     path('api/2fa/manage', views.manage_2fa, name='2fa-manage'),
#     path('api/2fa/status', views.status_2fa, name='2fa-status'),
#     path('api/2fa/request-verification', views.request_2fa_verification, name='request_2fa_verification'),

#     # Chat
#     path('api/chat/', include('chat.urls')),

#     # Email verification
#     path('api/email-verification/<str:token>/', views.verify_email, name='verify_email'),

#     # Player history
#     path('api/playerHistory/', include("game.urls"), name="history"),
# ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
