from channels import include

channel_routing = [
    include('chat.routing.chat_routing', path=r'^/chat/'),
    include('chat.routing.event_routing'),
]
