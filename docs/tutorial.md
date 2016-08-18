#### API tutorial

In this tutorial let's design a (very) simple chat app that demonstrates basic usage of this library. The **complete** example (with setup instructions) can be [found here]().

##### Front-end

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

##### Back-end

###### Configuration

Implementing the backend for `channel.js`-based apps is a little more involved but it is not too difficult! Let's create our Django project:

* `django-admin startproject chatter`
* `cd chatter`
* `django-admin startapp stocks`

Create a `requirements.txt` in the `chatter` project directory with the following:
```txt
asgi-redis==0.14.0
asgiref==0.14.0
autobahn==0.15.0
channels==0.17.1
daphne==0.14.3
dj-database-url==0.4.1
Django==1.9.8
msgpack-python==0.4.7
psycopg2==2.6.2
redis==2.10.5
six==1.10.0
Twisted==16.2.0
txaio==2.5.1
zope.interface==4.2.0
```

First, we have to configure Django Channels in `finance/finance/settings.py`:
```python
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'asgiref.inmemory.ChannelLayer',
        'ROUTING': 'chatter.routing.channel_routing',
    },
}
```

Don't forget to add`channels` and our `chatter` app to `INSTALLED_APPS` in `settings.py`:
```python
INSTALLED_APPS = [
    # ...
    'channels',
    
    'chatter',
]
```

Now, to setup ASGI, create `asgi.py` in `chatter/chatter` and populate it with:
```python
import os

from channels.asgi import get_channel_layer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chatter.settings')
channel_layer = get_channel_layer()
```

###### Routing

Finally, we have to wire up some initial routing in a new `routing.py` in `chatter/chatter`:

```python
from channels import include

channel_routing = [
    include('chat.routing.websocket_routing', path=r'^/chat/'),
    include('chat.routing.command_routing'),
]
```

Now, in our `chat` app, create another `routing.py` file that will handle our websocket events:
```python
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
```

###### Models

We'll need to create a model that represents a single chat room as well. In this model, let's also add some code that will be useful for our socket-based messaging:
```python
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

```


###### Templates and Views

Let's also create templates (omitted in this tutorial but found here), and a view:
```python
from django.shortcuts import render
from .models import Room


def chatroom(request, slug):
    room, created = Room.objects.get_or_create(slug=slug)
    return render(request=request,
                  template_name='chat/room.html',
                  context={'room': room})
```


###### Consumers

To handle these the websocket events we registered in the Javascript, add the following to a new `consumers.py` within the `chat` app (see [this file]() for the full implementation).

It's that simple! To get a fully working example, with no hiccups, follow the instructions in the README found here.

You've got a realtime app with Django! Now, I'd recommend you walk through the code of Django Channels creator's [examples](https://github.com/andrewgodwin/channels-examples) and convert his front-end code to work with `channel.js`.
