from channels import route, route_class

from .consumers import ChatServer, events, Demultiplexer, RoomBinding

chat_routing = [
    route_class(ChatServer, path=r'^(?P<slug>[^/]+)/stream/$'),
]

event_routing = [
    route('chat.receive', events.user_join, event=r'^user-join$'),
    route('chat.receive', events.user_leave, event=r'^user-leave$'),
    route('chat.receive', events.client_send, event=r'^message-send$'),
]

binding_routing = [
    route_class(Demultiplexer, path=r'^/binding/'),
    route('binding.room', RoomBinding.consumer),
]
