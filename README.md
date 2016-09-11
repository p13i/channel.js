## channel.js

A simple [socket.io](socket.io)-like Javascript front-end for Django Channels apps.

### Django Channels and `channel.js`

NodeJS' [socket.io](http://socket.io/) provides the simplest client-side API for developing websocket-based real-time applications. [Django Channels](https://channels.readthedocs.io/en/latest/) provides a simple and powerful backend API for managing real-time communications that easily ties in with [Django's ORM](http://tutorial.djangogirls.org/en/django_orm/). This project aims to provide a socket.io-like Javascript API for simple real-time applications.

### Getting started

Simply add the following references to your client-side HTML markup:
```html
<script type="text/javascript" src="
https://raw.githubusercontent.com/k-pramod/channel.js/master/dist/reconnecting-websocket.js"></script>
<script type="text/javascript" src="
https://raw.githubusercontent.com/k-pramod/channel.js/master/dist/channel-0.2.0.js"></script>
```

Or clone this repo and use the latest files from the `dist` directory.

### Documentation

Check out this [project's API](docs/channel.md) and [brief tutorial](docs/tutorial.md) in the [`docs`](docs) directory.

### Example

This project features a fully-worked, front-to-back example that illustrates how `channel.js` and Django Channels tie in together. Find the source code in the [`examples/chatter`](examples/chatter) directory where brief setup instructions can also be found.

### Future work

Features to be implemented in the near future include:

* More diverse examples with ['Deploy to Heroku'](https://devcenter.heroku.com/articles/heroku-button) buttons

### Contributing

If you would like to propose new features, please use this repo's [GitHub Issue tracker](https://github.com/k-pramod/channel.js/issues). If you would like to submit code to be included in future releases, please fork this repo and submit Pull Requests.

---
[Pramod Kotipalli](http://pramodk.net/)
