from datetime import datetime

from channels.message import Message
from ..models import Room


def user_join(message: Message, **kwargs):
    """
    Handles a user joining a room
    :param message: The websocket message
    :param kwargs: Route kwargs
    :return:
    """
    room = Room.objects.get(slug=message.content.pop('slug'))
    username = message.content.pop('username')
    room.add_member(
        username=username,
        reply_channel_name=message.content.pop('reply_channel_name')
    )
    room.emit(
        event='user-join',
        data={
            'members': room.members(),
            'username': username,
        }
    )


def user_leave(message: Message, **kwargs):
    """
    Handles when a user leaves the room
    """
    room = Room.objects.get(slug=message.content.pop('slug'))
    left_member = room.remove_member(reply_channel_name=message.reply_channel.name)

    # Send the user_leave message to the members in the room
    room.emit(
        event='user-leave',
        data={
            'members': room.members(),
            'username': left_member.username
        })


def client_send(message: Message, **kwargs):
    """
    Handles when the client sends a message
    """
    room = Room.objects.get(slug=message.content.pop('slug'))

    # Send the new message to the room
    room.emit(
        event='message-new',
        data={
            'msg': message.content['msg'],
            'username': message.content['username'],
            'time': datetime.now().strftime('%I:%M:%S %p')
        })

