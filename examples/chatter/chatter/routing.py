from channels import include

# Contains all routing for Django Channels messages
channel_routing = [
    include('chat.routing.chat_routing', path=r'^/chat/'),
    include('chat.routing.event_routing'),
    include('chat.routing.binding_routing'),
]
