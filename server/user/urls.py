from django.urls import path
from . import views


urlpatterns = [
    # current user
    path('', views.user_view, name='user'),

    # All users
    path('/all', views.users_view, name='users'),

    # Target user
    path('/<int:user_id>', views.target_user_view, name='user_detail'),

    # change username
    path('/change/username', views.change_username, name='change_username'),

    # change image
    path('/change/image', views.change_image, name='change_image'),

    # delete account
    path('/delete/account', views.delete_account, name='delete_account'),

    # reset password
    path('/request-reset', views.request_password_reset, name='request-reset'),
    path('/reset-password', views.reset_password, name='reset_password'),
    path('/verify-token', views.verify_reset_token, name='verify-token'),

]