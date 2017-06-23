from django.contrib import admin

from .models import Room, ChatMessage, Member

admin.site.register(Room)
admin.site.register(ChatMessage)
admin.site.register(Member)
