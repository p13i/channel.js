# API tutorial

In this tutorial let's design a (very) simple chat app that demonstrates basic usage of this library.


## Complete example

The **complete** example (with setup instructions) can be [found here](../examples/chatter/). **This 'tutorial' is not meant to produce functional code so you should definitely clone the example and set it up with the instructions in the [README](../examples/chatter/README.md)**

## Front-end

After instantiating a `new Channel(wsPath)` to the specified `wsPath` URL, you may register events through the `.on(event, func)` function and send messages with the `.emit(command, data)`.

Consider a simple chat application that allows users to send and recieve messages in real time. The submission for looks like:
```html
<input type="text" id="chat-username"/>
<textarea id="chat-form" rows="1"></textarea>
<button id="chat-submit" type="submit">Submit</button>
```
(Here the `textarea` is where users type in their messages.)

We instantiate a connection to the web socket listening at `/chat/myRoom/stream/`.
```js
var channel = new Channel('/chat/myRoom/stream/');
```

Next, we listen for new message `event`s from our server (`$` is [jQuery](https://jquery.com/)).
```js
channel.on('message-new', function (data) {
    $('#chat-messages').prepend(
        data['username'] + ' | ' + data['msg']
    );
});
```

It's that simple!

Now, say we want to send messages when the user hits `Submit`:
```js
var submit_button = $('#chat-submit');
submit_button.on('click', function () {
    var username = $('#chat-username');
    var message = $('#chat-form');
    var data = {
        'msg': message.val(),
        'username': username.val()
    };
    username.attr('disabled', true);
    message.val('');
    channel.emit('message-send', data);
});
```

It's that simple! `channel.js` takes take of parsing JSON, modifying dictionaries, serializing, and provides this simple API. The full Javascript source for thie example can be found here inside the working project

## Back-end

### Configuration

Implementing the backend for `channel.js`-based apps is a little more involved but it is not too difficult! Let's create our Django project:

* `django-admin startproject chatter`
* `cd chatter`
* `django-admin startapp chat`

First, we have to configure Django Channels in `chatter/chatter/settings.py`:
```python
# chatter/chatter/settings.py
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'asgiref.inmemory.ChannelLayer',
        'ROUTING': 'chatter.routing.channel_routing',
    },
}
```

Don't forget to add`channels` and our `chatter` app to `INSTALLED_APPS` in `settings.py`:
```python
# chatter/chatter/settings.py
# ...
INSTALLED_APPS = [
    # ...
    'channels',
    
    'chatter',
]
# ...
```

Now, to setup ASGI, create `asgi.py` in `chatter/chatter` and populate it with:
```python
# chatter/chatter/asgi.py
import os

from channels.asgi import get_channel_layer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chatter.settings')
channel_layer = get_channel_layer()
```

### Routing

Finally, we have to wire up some initial routing in a new `routing.py` in `chatter/chatter`:

```python
# chatter/chatter/routing.py
from channels import include

channel_routing = [
    include('chat.routing.chat_routing', path=r'^/chat/'),
    include('chat.routing.event_routing'),
]
```

Now, in our `chat` app, create another `routing.py` file that will handle our websocket events:
```python
# chatter/chat/routing.py
from channels import route, route_class
from .consumers import ChatServer, events

chat_routing = [
    route_class(ChatServer, path=r'^(?P<slug>[^/]+)/stream/$'),
]

event_routing = [
    route('chat.receive', events.user_join, event=r'^user-join$'),
    route('chat.receive', events.user_leave, event=r'^user-leave$'),
    route('chat.receive', events.client_send, event=r'^message-send$'),
]
```

### Models

We'll need to create a model that represents a single chat room as well. In this model, let's also add some code that will be useful for our socket-based messaging. Check out [chatter/chat/models.py](../examples/chatter/chat/models.py) for the full (and commented) implementation. 


### Templates and Views

Let's also create templates (omitted in this tutorial but [found here](../examples/chatter/chat/templates/)), and a view that will simply serve the chat room HTML page:
```python
# chatter/chat/views.py
from django.shortcuts import render
from .models import Room


def chatroom(request, slug):
    room, created = Room.objects.get_or_create(slug=slug)
    return render(request=request,
                  template_name='chat/room.html',
                  context={'room': room})
```


### Consumers

To handle these the websocket events we registered in the Javascript, add two files to a `consumers` within the `chat` app (see [this file](../examples/chatter/chat/consumers.py) for the full implementation):

* [`base.py`](../examples/chatter/chat/consumers/events.py) contains class (`class ChatServer(JsonWebsocketConsumer)`) that handles the basics of connecting to the server, recieving messages, and disconnecting from the server.
* [`events.py`](../examples/chatter/chat/consumers/events.py) handles all the events from [chat/routing.py](../examples/chatter/chat/routing.py) file's event_routing list. **Note**: The line `Channel('chat.receive').send(content=content)` in [`base.py`](../examples/chatter/chat/consumers/events.py) is the method that finds a match in the `event_routing` list and calls on the corresponding consumer function in [`events.py`](../examples/chatter/chat/consumers/events.py).

It's that simple! To get a fully working example, with no hiccups, follow the instructions in [the README found here](../examples/chatter/README.md).

You've got a realtime app with Django! Now, I recommend you walk through the code of Django Channels creator's [examples](https://github.com/andrewgodwin/channels-examples) and convert his front-end code to work with `channel.js`.
