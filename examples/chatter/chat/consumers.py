from channels import Group, Channel
from channels.message import Message

from .models import Room
from .utils import get_payload
from datetime import datetime


def ws_connect(message: Message, slug: str) -> None:
    """
    Handles connecting to the websocket
    :param message: The socket message
    :param slug: The name of the room
    """
    Group(slug).add(message.reply_channel)

    # Call the function that handles connecting to a chat room
    chat_connect(message, slug)


def ws_receive(message: Message, slug: str) -> None:
    """
    Handles receiving websocket messages
    """
    # Unpack the message and send it to metronome.routing.command_routing list
    Channel('chat.receive').send(
        content=get_payload(message, slug)
    )


def ws_disconnect(message: Message, slug: str) -> None:
    """
    Handles disconnecting from a room
    """
    Group(slug).discard(message.reply_channel)

    # Handles when a user leaves a chat room
    chat_leave(message, slug)


def chat_connect(message: Message, slug: str) -> None:
    """
    Handles a user connecting to a room
    :param message: The Channel message
    :param slug: The room's slug
    """
    room, created = Room.objects.get_or_create(slug=slug)

    room.member_count += 1
    room.save()

    # Send a user_join event to all the users in this room
    room.emit(
        event='user-join',
        data={
            'member_count': room.member_count,
        })


def chat_send(message: Message) -> None:
    """
    Handles sending a new message to the room
    """
    room = Room.objects.get(slug=message.content['slug'])

    # Send the new message to the room
    room.emit(
        event='message-new',
        data={
            'msg': message.content['msg'],
            'username': message.content['username'],
            'time': datetime.now().strftime('%I:%M:%S %p')
        })


def chat_leave(message: Message, slug: str) -> None:
    """
    Handles when a user leaves a room
    """
    room = Room.objects.get(slug=slug)
    room.member_count -= 1
    room.save()

    # Send the user_leave message to the members in the room
    room.emit(
        event='user-leave',
        data={
            'member_count': room.member_count
        })
