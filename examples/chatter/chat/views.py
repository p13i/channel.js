from django.http import HttpRequest, HttpResponse
from django.shortcuts import render

from .models import Room


def chatroom(request: HttpRequest, slug: str) -> HttpResponse:
    """
    Handles displaying the chat room page
    :param request: The HTTP request
    :param slug: The name of the room
    :return: The metronome room with the given name
    """
    room, created = Room.objects.get_or_create(slug=slug)

    return render(request=request,
                  template_name='chat/room.html',
                  context={'room': room})
