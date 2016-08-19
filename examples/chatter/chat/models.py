import json

from channels import Group
from django.db import models


class Room(models.Model):
    """
    Represents a room containing chat users
    """
    # The name of the room found in the room URL
    slug = models.CharField(max_length=32, unique=True)

    def emit(self, event: str, data: dict) -> dict:
        data['event'] = event
        self.group.send({
            'text': json.dumps(data)
        })

    def add_member(self, **kwargs) -> 'Member':
        """
        Adds a new member to this room
        :param kwargs: The properties of the new user
        :return: The new member
        """
        kwargs['room'] = self
        new_member = Member.objects.create(**kwargs)
        self.member_set.add(new_member)
        return new_member

    def remove_member(self, **kwargs) -> 'Member':
        """
        Removes a members from this room
        :param kwargs: The search parameters for finding the Member to remove
        :return: The removed Member
        """
        member = self.member_set.get(**kwargs)
        member.delete()
        return member

    def members(self):
        """
        Returns an array of member information
        """
        return [member.serialized for member in self.member_set.all()]

    @property
    def member_count(self) -> int:
        return self.member_set.count()

    @property
    def group(self) -> Group:
        return Group(self.slug)


class Member(models.Model):
    """
    Represents a user that belongs to a room
    """
    room = models.ForeignKey(Room, null=False)
    username = models.CharField(max_length=128, null=False)
    # The name of the reply_channel
    reply_channel_name = models.CharField(max_length=128, null=False)

    @property
    def serialized(self):
        """
        Provides a serialized version of this member
        :return:
        """
        return {
            'username': self.username
        }
