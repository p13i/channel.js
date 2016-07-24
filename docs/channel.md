### Django Channels and `channel.js`

The aim of this project is provide a front-end Javascript API and set of backend "best practices" that make it incredibly easy to develop real-time applications with Django.

#### Overview

NodeJS's [socket.io](http://socket.io/) provides the simplest client-side API for developing websocket-based real-time applications. [Django Channels](https://channels.readthedocs.io/en/latest/) provides a simple and powerful backend API for managing real-time communications that easily ties in with [Django's ORM](http://tutorial.djangogirls.org/en/django_orm/). This project aims to provide a socket.io-like Javascript API for simple real-time applications.

#### Getting started

Simply add the following references to your client-side HTML markup:
```html
<script type="text/javascript" src="
https://raw.githubusercontent.com/k-pramod/channels.js/master/src/js/reconnecting-websockets.js"></script>
<script type="text/javascript" src="
https://raw.githubusercontent.com/k-pramod/channels.js/master/src/js/channel.js"></script>
```

#### Concepts

With `channels.js`, clients receive `event`s from the server and send `command`s to the server. When an event is received, `channels.js` calls upon a registered client-side function which takes a data dictionary and performs the needed actions. To send a message, the client will `emit` data to the server through a `command` string.

#### Tutorial

Checkout `tutorial.md`!