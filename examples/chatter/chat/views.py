from django.core.urlresolvers import reverse
from django.http import HttpRequest, HttpResponse
from django.shortcuts import render, redirect

from .forms import RoomForm
from .models import Room


def index(request):  # type: (HttpRequest) -> HttpResponse
    form = RoomForm(form_action=reverse('index'), data=request.POST or None)

    if request.method == 'POST' and form.is_valid():
        return redirect('room', slug=form.cleaned_data['slug'])

    context = {
        'rooms': Room.objects.all(),
        'form': form,
    }

    return render(request, 'chat/index.html', context)


def chatroom(request, slug):  # type: (HttpRequest, str) -> HttpResponse
    """
    Handles displaying the chat room page
    :param request: The HTTP request
    :param slug: The name of the room
    :return: The metronome room with the given name
    """
    room, created = Room.objects.get_or_create(slug=slug)
    rooms = Room.objects.all()

    context = {
        'room': room,
        'rooms': rooms,
    }

    return render(request, 'chat/room.html', context)
