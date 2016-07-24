#### API tutorial

In this tutorial let's design a (very) simply financial portfolio app that displays stock prices to users.

##### Front-end

After instantiating a `new Channel(wsPath)` to the specified `wsPath` URL, you may register events through the `.on(event, func)` function and send messages with the `.emit(command, data)`.

For example, consider a stock ticker application that updates a stock price when data is received from the server:
```html
<!-- index.html -->

<h4>Stock ticker for MSFT</h4>
<span id="price">56.57</span>
```

We instantiate a connection to the web socket listening at `/stockets/msft/stream/`.
```js
var channel = new Channel('/stocks/msft/stream/');
```

Next, we listen for price change `event`s from our server (`$` is [jQuery](https://jquery.com/)).
```js
var updatePrice = function (data) {
    var newPrice = data['stockPrice'];
    $("#price").html(newPrice);
};
channel.on('price_change', updatePrice);
```

It's that simple!

Now, say we want to acknowledge the fact that we have received and updated the price. Let's just change `updatePrice` to `emit` a message back:
```js
var updatePrice = function (data) {
    var newPrice = data['stockPrice'];
    $("#price").html(newPrice);

    var msg = {
        'received_at': new Date().toString(),
    }
    channel.emit('acknowledge_receipt', msg);
}
```

It's that simple! `channel.js` takes take of parsing JSON, modifying dictionaries, serializing, and more.

##### Back-end

Implementing the backend for `channel.js`-based apps is a little more involved but it is not too difficult! Let's create our Django project:

* `pip install channels`
* `django-admin startproject finance`
* `django-admin startapp stocks`

First, we have to configure Django Channels in `finance/finance/settings.py`:
```python
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "asgi_redis.RedisChannelLayer",
        "CONFIG": {
            "hosts": [
                os.environ.get('REDIS_URL'),
            ],
        },
        "ROUTING": "finance.routing.channel_routing",
    },
}
```
In this tutorial, I've added a URL to a [Redis](http://redis.io/) database (used in Django Channels' backend) as an environment variable.

Don't forget to add`channels` and our `stocks` app to `INSTALLED_APPS` in `settings.py`:
```python
INSTALLED_APPS = [
    # ...
    'channels',
    'metronome.app.MetronomeConfig',
]
```

Now, to setup ASGI, create `asgi.py` in `finance/finance` and populate it with:
```python
import os

from channels.asgi import get_channel_layer

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "finance.settings")
channel_layer = get_channel_layer()
```

Finally, we have to wire up some initial routing in a new `routing.py` in `finance/finance`:

```python
from channels import include

channel_routing = [
    include('stocks.routing.websocket_routing', path=r'^/stocks/'),
    include('stocks.routing.command_routing'),
]
```

Now, in our `stocks` app, create another `routing.py` file that will handle our websocket events:
```python
from channels import route
from .consumers import ws_connect, ws_receive, ws_disconnect, receipt


websocket_routing = [
    route("websocket.connect", ws_connect, path=r'^(?P<slug>[^/]+)/stream/$'),
    symbol("websocket.receive", ws_receive, path=r'^(?P<symbol>[^/]+)/stream/$'),
    route("websocket.disconnect", ws_disconnect, path=r'^(?P<symbol>[^/]+)/stream/$'),
]

command_routing = [
    route("stocks.receive", receipt, command=r'^acknowledge_receipt'),
]
```

To consume these websocket events, add the following to a new `consumers.py`:
```python
from channels import Group, Channel


def ws_connect(message, symbol):
    """
    Handles connecting to the websocket
    :param message: The socket message
    :param symbol: The stock name
    """
    # Add the new user to a group that can be sent messages
    Group(symbol).add(message.reply_channel)


def ws_receive(message, symbol):
    """
    Handles receiving websocket messages
    """
    content = message.content

    # Construct a payload that can be sent to custom consumers
    payload = json.loads(content['text'])
    payload['symbol'] = symbol
    payload['reply_channel'] = content['reply_channel']

    # Unpack the message and send it to stocks.routing.command_routing list
    Channel("stocks.receive").send(payload)


def ws_disconnect(message, symbol):
    """
    Handles disconnecting from a room
    """
    # You can log socket messages here
    # Forget about the user that disconnected
    Group(symbol).discard(message.reply_channel)


def receipt(payload):
    received_at = payload['received_at']
    stock_symbol = payload['symbol']
    # Do something with `received_at` and `symbol`
```

It's that simple! You've got a realtime app with Django! Now, I'd recommend you walk through the code of Django Channels creator's [examples](https://github.com/andrewgodwin/channels-examples) and convert his front-end code to work with `channel.js`.