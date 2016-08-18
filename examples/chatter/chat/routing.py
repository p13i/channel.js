from channels import route
from .consumers import ws_connect, ws_receive, ws_disconnect, chat_send


websocket_routing = [
    route("websocket.connect", ws_connect, path=r'^(?P<slug>[^/]+)/stream/$'),
    route("websocket.receive", ws_receive, path=r'^(?P<slug>[^/]+)/stream/$'),
    route("websocket.disconnect", ws_disconnect, path=r'^(?P<slug>[^/]+)/stream/$'),
]

command_routing = [
    route('chat.receive', chat_send, command=r'^message-send'),
]
