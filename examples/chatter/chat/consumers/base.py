from typing import Dict, Any

from channels import Group, Channel
from channels.generic.websockets import JsonWebsocketConsumer
from channels.message import Message


class ChatServer(JsonWebsocketConsumer):
    # Set to True if you want them, else leave out
    strict_ordering = False
    slight_ordering = False

    def connection_groups(self, **kwargs):
        """
        Called to return the list of groups to automatically add/remove
        this connection to/from.
        """
        return kwargs.pop('name')

    def connect(self, message: Message, **kwargs: Dict[str, Any]) -> None:
        """
        Handles connecting to the websocket
        :param message: The socket message
        """
        name = kwargs.pop('name')
        Group(name).add(message.reply_channel)
        self.message.reply_channel.send({"accept": True})

    def receive(self, content: Dict[str, Any], **kwargs: Dict[str, Any]) -> None:
        """
        Handles receiving websocket messages
        """
        # Re-introduce the kwargs into the content dict
        content.update(kwargs)
        content['reply_channel_name'] = self.message.reply_channel.name
        # Unpack the message and send it to metronome.routing.command_routing list
        Channel('chat.receive').send(content=content)

    def disconnect(self, message: Message, **kwargs: Dict[str, Any]):
        """
        Handles disconnecting from a room
        """
        name = kwargs['name']
        Group(name).discard(message.reply_channel)

        # Handle a user-leave event
        message.content['event'] = 'user-leave'
        self.receive(message.content, **kwargs)
