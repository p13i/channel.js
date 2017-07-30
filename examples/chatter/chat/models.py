import json
from typing import Dict, Any, List

from channels import Group
from django.core.urlresolvers import reverse
from django.db import models


class ChatMessage(models.Model):
    room = models.ForeignKey(
        help_text="The Room this ChatMessage belongs to.",
        to='chat.Room',
        related_name='messages',
        on_delete=models.CASCADE,
    )
    sender = models.ForeignKey(
        help_text="The Member that sent this message.",
        to='chat.Member',
        related_name='messages',
    )
    text = models.CharField(
        help_text="The text of the message",
        max_length=128,
        null=False,
    )
    timestamp = models.DateTimeField(
        help_text="When this message was sent",
        auto_now_add=True,
        null=False,
    )

    class Meta:
        ordering = ('-timestamp',)

    def __str__(self):
        return "{username} | {text}".format(username=self.sender.username, text=self.text)


class Room(models.Model):
    """
    Represents a room containing chat users
    """
    # The name of the room found in the room URL
    name = models.CharField(
        help_text="The name of this Room",
        max_length=32,
        unique=True,
    )

    def emit(self, event: str, data: Dict[str, Any]) -> None:
        data['event'] = event
        self.group.send({
            'text': json.dumps(data)
        })

    def add_member(self, username, reply_channel_name) -> None:
        """
        Adds a new member to this room
        :param kwargs: The properties of the new user
        :return: The new member
        """
        new_member, created = Member.objects.get_or_create(username=username)  # type: (Member,bool)
        new_member.reply_channel_name = reply_channel_name
        new_member.room = self
        new_member.save()

        return new_member

    def remove_member(self, **kwargs: Dict[str, Any]) -> 'Member':
        """
        Removes a members from this room
        :param kwargs: The search parameters for finding the Member to remove
        :return: The removed Member
        """
        member = self.member_set.get(**kwargs)
        member.room = None
        member.save()

        return member

    def members(self) -> List[Dict[str, Any]]:
        """
        Returns an array of member information
        """
        return [member.as_dict for member in self.member_set.all()]

    def receive(self, message_text: str, from_username: str) -> None:
        msg = ChatMessage.objects.create(
            sender=Member.objects.get(username=from_username),
            text=message_text,
            room=self,
        )
        self.messages.add(msg)

        self.emit(
            event='message-new',
            data={
                'msg': msg.text,
                'username': msg.sender.username,
                'time': msg.timestamp.isoformat(),
            })

    @property
    def member_count(self) -> int:
        return self.member_set.count()

    @property
    def group(self) -> Group:
        return Group(self.name)

    def get_absolute_url(self) -> str:
        return reverse('chat:room', kwargs={'name': self.name})

    def __str__(self) -> str:
        return "'{}' room ({} members)".format(self.name, self.member_count)


class Member(models.Model):
    """
    Represents a user that belongs to a room
    """
    room = models.ForeignKey(
        help_text="The Room this Memebr belongs too.",
        to=Room,
        null=True,
        on_delete=models.SET_NULL,
    )
    username = models.CharField(
        help_text="The username of this Member",
        max_length=128,
        null=False,
        unique=True,
    )
    # The name of the reply_channel
    reply_channel_name = models.CharField(
        help_text="The Django Channels identifier that can be used to send messages back to the user",
        max_length=128,
        null=False,
    )

    @property
    def as_dict(self) -> Dict[str, Any]:
        """
        Provides a serialized version of this member
        :return:
        """
        return {
            'username': self.username
        }
