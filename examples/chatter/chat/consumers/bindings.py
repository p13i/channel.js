from channels.binding.websockets import WebsocketBinding, WebsocketDemultiplexer

from ..models import Room


class RoomBinding(WebsocketBinding):
    model = Room
    stream = 'room'
    fields = ['__all__']

    @classmethod
    def group_names(cls, instance, action):
        return ['room-updates']

    def has_permission(self, user, action, pk):
        # Public access
        return True


class Demultiplexer(WebsocketDemultiplexer):
    mapping = {
        'room': 'binding.room',
    }

    def connection_groups(self):
        return ["room-updates"]
