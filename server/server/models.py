from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.timezone import now
from datetime import timedelta


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    friends = models.ManyToManyField('self', symmetrical=True, blank=True)
    is_2fa_enabled = models.BooleanField(default=False)
    totp_secret = models.CharField(max_length=32, null=True, blank=True)
    ban_login = models.BooleanField(default=False)
    reset_token = models.CharField(max_length=255, null=True, blank=True)
    reset_token_expiry = models.DateTimeField(null=True, blank=True)
    last_active = models.DateTimeField(null=True, blank=True)
    is_online = models.BooleanField(default=False)

    def update_online_status(self):
        if self.last_active is None:
            self.is_online = False
        else:
            threshold = timezone.now() - timedelta(minutes=5)
            self.is_online = self.last_active >= threshold
        self.save(update_fields=['is_online'])
        return self.is_online

    def set_online(self):
        self.last_active = timezone.now()
        self.is_online = True
        self.save(update_fields=['last_active', 'is_online'])

    def set_offline(self):
        self.last_active = None  # or timezone.now() - timedelta(minutes=6)
        self.is_online = False
        self.save(update_fields=['last_active', 'is_online'])

    def __str__(self):
        return f"{self.user.username}'s Profile"


from django.db import models
from django.utils import timezone
from datetime import timedelta
import random

class TwoFactorVerification(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    @property
    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=2)

    @classmethod
    def generate_code(cls):
        return ''.join([str(random.randint(0, 9)) for _ in range(6)])