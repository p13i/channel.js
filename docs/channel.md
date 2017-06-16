# `channel.js` API

The aim of this project is provide a front-end Javascript API and set of backend practices that make it incredibly easy to develop real-time applications with Django.

## Concepts

With `channel.js`, clients receive `event`s from the server and send `event`s to the server. When an event is received from the server, `channel.js` calls upon a registered client-side function which performs the needed actions. To send a message, the client will `emit` an event and data to the server through a `event` string. **This project is under active development so this API may change over time.**

## API (v0.2.0)

* `Channel` - the Javascript 'class' wrapping a web socket connection

    * **constructor**: `new Channel(webSocketPath)`:

        * `webSocketPath` (type: `string`): The path of the websocket

        _Example_:
        ```javascript
        // Connect to a websocket at `ws://your-host/chat/room-name/stream/`
        var relative_path = '/chat/room-name/stream/';
        var channel = new Channel(relative_path);

        // Connect to a websocket on another server at `ws://other-host/chat/room-name/stream/`
        var absolute_path = 'ws://example.com/chat/room-name/stream/';
        var someones_channel = new Channel(absolute_path);
        ```

    * `.on(eventName, clientFunction)`:
        
        * `eventName` (type: `string`): the event received from a server that should trigger a client-side event
        
        * `clientFunction` (type: `function`): a function that takes in a `data` dictionary parameter

        _Example_:
        ```javascript
        // Wait for the `message-new` event from the Channel server
        channel.on('message-new', function (data) {
            // Append a new message to our messages collection
            var message = data['msg'] + '<br/>';
            $('#messages').append(message)
        });
        ```
    
    * `.emit(eventName, data)`:
    
        * `eventName` (type: `string`): The task to notify the server of (e.g. 'user-join' or 'message-send')
    
        * `data` (type: dictionary): The data to be sent to the websocket server
        
        This method takes the given `data` dictionary and adds a new entry for the `eventName` provided: `data['event'] = eventName`. This `data` dictionary is serialized with `JSON.stringify` and is sent with the underlying `WebSocket`. The backend should use the `eventName` attribute as appropriate.
        
        _Example_: When an HTML button is clicked, send a message to the Channel
        ```html
        <!-- The message input and submit button -->
        
        <input id="message-content" type="text"/>
        <button id="chat-send" type="submit">Send</button>
        ```
        
        ```javascript
        // When the user clicks on the Send button, send his/her message to the Channel
        $('#chat-send').on('click', function () {
            // Get the message from the input
            var msg = $('#message-content').val();
            var data = {'msg': msg};
            // Send the message
            channel.emit('message-send', data);
        });
        ```
    
    * `.bind('streamName')`:
        
        * `streamName` (type: `string`): The name of the data-binding stream to listen to
        
        * **returns** `BindingAgent` object that allows you to easily register `create`, `update`, and `destroy` (delete) functions
        
        _Example_: You can create a new channel just for handling data bindings
        ```javascript
        var channel = new Channel('/binding/');
        channel.bind('room')
            .create(function(data) { ... })
            .update(function(data) { ... })
            .destroy(function(data) { ... });
           
        channel.bind('message')
            .create(function(data) { ... });
        ```
        In each of these consumer functions, the `data` parameter contains all the fields of the Django database model. The `...` portion of the functions can take care of updating the HTML with the new or updated data.

Just like with socket.io, `.on` is used to take client-side actions and `.emit` is used to send messages to the server.

## Change log

See the GitHub repo's [Releases page](https://github.com/k-pramod/channel.js/releases) for a list of changes with each release.
