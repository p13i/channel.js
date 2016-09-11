from django.shortcuts import render

from .models import Room


def chatroom(request, slug):  # type: (HttpRequest, str) -> HttpResponse
    """
    Handles displaying the chat room page
    :param request: The HTTP request
    :param slug: The name of the room
    :return: The metronome room with the given name
    """
    room, created = Room.objects.get_or_create(slug=slug)
    rooms = Room.objects.all()
    return render(request=request,
                  template_name='chat/room.html',
                  context={
                      'room': room,
                      'rooms': rooms,
                  })
