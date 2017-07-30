from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.http import HttpRequest, HttpResponse
from core.decorators import require_GET_or_POST
from django.shortcuts import render, redirect

from chat.forms import RoomForm
from chat.models import Room


@require_GET_or_POST
@login_required
def home(request: HttpRequest) -> HttpResponse:
    """
    Displays the user's home page (GET) or goes a new room (POST)
    :param request: The authenticated HTTP request
    :return: The user's home page or a redirection to a specified chat room
    """
    form = RoomForm(form_action=reverse('chat:home'), data=request.POST or None)

    # If the user is requesting to go a new room, then redirect there.
    if request.method == 'POST' and form.is_valid():
        return redirect('chat:room', name=form.cleaned_data['name'])

    context = {
        # Display all rooms in the database
        'rooms': Room.objects.all(),
        'form': form,
    }

    return render(request, 'chat/home.html', context)


@login_required
def chatroom(request: HttpRequest, name: str) -> HttpResponse:
    """
    Handles displaying the chat room page
    :param request: The HTTP request
    :param name: The name of the room
    :return: The metronome room with the given name
    """

    room, created = Room.objects.get_or_create(name=name)

    context = {
        'room': room,
        'rooms': Room.objects.all(),
    }

    return render(request, 'chat/room.html', context)
