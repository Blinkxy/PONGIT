from django.db import models
from django.contrib.auth.models import User
from server.models import UserProfile
# Create your models here.


# models.py
class Friendship(models.Model):
    PENDING = 'pending'
    ACCEPTED = 'accepted'
    BLOCKED = 'blocked'

    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (ACCEPTED, 'Accepted'),
        (BLOCKED, 'Blocked'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friendships")
    friend = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friends_with")
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=PENDING)
    blocked_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='blocks_initiated',
        null=True,
        blank=True
    )

    class Meta:
        unique_together = ('user', 'friend')
        verbose_name = "Friendship"
        verbose_name_plural = "Friendships"

    def __str__(self):
        return f"{self.user.username} is friends with {self.friend.username} ({self.get_status_display()})"
