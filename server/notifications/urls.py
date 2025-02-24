from django.urls import path
from . import views

urlpatterns = [
    path('notification/', views.get_notifications, name='get_notifications'),
    path('invitation/', views.get_invitation, name='get_invitation'),
    # path('<int:notification_id>/read/', 
    #      views.mark_as_read, name='mark_notification_read'),
]
