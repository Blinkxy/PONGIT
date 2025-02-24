from django.utils import timezone
from server.models import UserProfile





class UpdateLastActivityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            try:
                profile = request.user.profile
                profile.last_active = timezone.now()
                profile.save(update_fields=['last_active'])
                profile.update_online_status()
            except UserProfile.DoesNotExist:
                pass
        return self.get_response(request)