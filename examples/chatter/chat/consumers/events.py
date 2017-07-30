from typing import Dict, Any

from channels.message import Message

from chat.models import Room


def user_join(message: Message, **kwargs: Dict[str, Any]) -> None:
    """
    Handles a user joining a room
    :param message: The websocket message
    :param kwargs: Route kwargs
    :return:
    """
    room = Room.objects.get(name=message.content.pop('name'))
    username = message.content.pop('username')
    room.add_member(
        username=username,
        reply_channel_name=message.content.pop('reply_channel_name'),
    )
    room.emit(
        event='user-join',
        data={
            'members': room.members(),
            'username': username,
        }
    )


def user_leave(message: Message, **kwargs: Dict[str, Any]) -> None:
    """
    Handles when a user leaves the room
    """
    room = Room.objects.get(name=message.content.pop('name'))
    left_member = room.remove_member(reply_channel_name=message.reply_channel.name)

    # Send the user_leave message to the members in the room
    room.emit(
        event='user-leave',
        data={
            'members': room.members(),
            'username': left_member.username,
        })


def client_send(message: Message, **kwargs: Dict[str, Any]) -> None:
    """
    Handles when the client sends a message
    """
    print("RECEIVED MESSAGE {}".format(message.content['msg']), flush=True)
    room = Room.objects.get(name=message.content.pop('name'))

    # Send the new message to the room
    room.receive(
        message_text=message.content['msg'],
        from_username=message.content['username'],
    )

    print("Messages in room: {}".format(room.messages.count()), flush=True)
