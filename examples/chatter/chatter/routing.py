from channels import include, route_class

channel_routing = [
    include('chat.routing.chat_routing', path=r'^/chat/'),
    include('chat.routing.event_routing'),
]
