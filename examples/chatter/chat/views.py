from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.http import HttpRequest, HttpResponse
from django.shortcuts import render, redirect

from .forms import RoomForm
from .models import Room


@login_required
def home(request: HttpRequest) -> HttpResponse:
    form = RoomForm(form_action=reverse('chat:home'), data=request.POST or None)

    if request.method == 'POST' and form.is_valid():
        return redirect('chat:room', slug=form.cleaned_data['slug'])

    context = {
        'rooms': Room.objects.all(),
        'form': form,
    }

    return render(request, 'chat/home.html', context)


@login_required
def chatroom(request: HttpRequest, slug: str) -> HttpResponse:
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
