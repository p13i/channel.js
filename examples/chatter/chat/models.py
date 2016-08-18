import json

from channels import Group
from django.db import models


class Room(models.Model):
    slug = models.CharField(max_length=32, unique=True)
    member_count = models.PositiveIntegerField(default=0)

    def emit(self, event: str, data: dict):
        data['event'] = event
        self.group.send({
            'text': json.dumps(data)
        })

    @property
    def group(self):
        return Group(self.slug)
