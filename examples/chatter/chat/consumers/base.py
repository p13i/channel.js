from datetime import datetime

from channels.generic.websockets import JsonWebsocketConsumer
from channels import Group, Channel
from channels.message import Message
from ..models import Room


class ChatServer(JsonWebsocketConsumer):
    # Set to True if you want them, else leave out
    strict_ordering = False
    slight_ordering = False

    def connection_groups(self, **kwargs):
        """
        Called to return the list of groups to automatically add/remove
        this connection to/from.
        """
        return kwargs.pop('slug')

    def connect(self, message, **kwargs):  # type: (Message, dict)
        """
        Handles connecting to the websocket
        :param message: The socket message
        """
        slug = kwargs.pop('slug')
        Group(slug).add(message.reply_channel)

    def receive(self, content, **kwargs):  # type: (dict, dict)
        """
        Handles receiving websocket messages
        """
        # Re-introduce the kwargs into the content dict
        content.update(kwargs)
        content['reply_channel_name'] = self.message.reply_channel.name
        # Unpack the message and send it to metronome.routing.command_routing list
        Channel('chat.receive').send(content=content)

    def disconnect(self, message, **kwargs):  # type: (Message, dict)
        """
        Handles disconnecting from a room
        """
        slug = kwargs['slug']
        Group(slug).discard(message.reply_channel)

        # Handle a user-leave event
        message.content['event'] = 'user-leave'
        self.receive(message.content, **kwargs)

