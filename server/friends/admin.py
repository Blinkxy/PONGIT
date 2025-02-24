from django.contrib import admin
from django.contrib import admin
from .models import Friendship

# Register your models here.

@admin.register(Friendship)
class FriendshipAdmin(admin.ModelAdmin):
    list_display = ('user', 'friend', 'created_at')
    search_fields = ('user__username', 'friend__username')
