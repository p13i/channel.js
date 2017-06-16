from django.core.urlresolvers import reverse
from django.http import HttpRequest, HttpResponse
from django.shortcuts import render, redirect

from .forms import RoomForm
from .models import Room


def index(request):
    form = RoomForm(form_action=reverse('index'), data=request.POST or None)

    if request.method == 'POST':
        if form.is_valid():
            return redirect('room', slug=form.cleaned_data['slug'])

    return render(request, 'chat/index.html', {'rooms': Room.objects.all(), 'form': form})


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
