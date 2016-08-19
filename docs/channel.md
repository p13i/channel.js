## `channel.js` API

The aim of this project is provide a front-end Javascript API and set of backend practices that make it incredibly easy to develop real-time applications with Django.

### Concepts

With `channel.js`, clients receive `event`s from the server and send `event`s to the server. When an event is received from the server, `channel.js` calls upon a registered client-side function which performs the needed actions. To send a message, the client will `emit` an event and data to the server through a `event` string. **This project is under active development so this API may change over time.**

### API

* `Channel` - the Javascript 'class' wrapping a web socket connection

    * **constructor**: `new Channel(ws_path, path_type)`:

        * `ws_path` (type: `string`): The path of the websocket

        * `path_type` (type: `string`) (options: `relative`, `absolute`): The type of URI passed as `ws_path`. `relative` indicates that the `ws_path` provided is found on this host (i.e. `window.location.host`). `absolute` indicates that the `ws_path` is an absolute websocket path

        _Example_:
        ```javascript
        // Connect to a websocket at `ws://your-host/chat/room-name/stream/`
        var relative_path = '/chat/room-name/stream/';
        var channel = new Channel(relative_path, 'relative');
        // In this case, the `path_type` is optional. So the following is equivalent:
        var channel = new Channel(relative_path);

        // Connect to a websocket on another server at `ws://other-host/chat/room-name/stream/`
        var absolute_path = 'ws://other-host/chat/room-name/stream/';
        var someones_channel = new Channel(absolute_path, 'absolute');
        ```

    * `.on(event_name, func)`:
        
        * `event_name` (type: `string`): the event received from a server that should trigger a client-side event
        
        * `func` (type: `function`): a function that takes in a `data` dictionary parameter

        _Example_:
        ```javascript
        // Wait for the `message-new` event from the Channel server
        channel.on('message-new', function (data) {
            // Append a new message to our messages collection
            var message = data['msg'] + '<br/>';
            $('#messages').append(message)
        });
        ```
    
    * `.emit(event_name, data)`:
    
        * `event_name` (type: `string`): The task to notify the server of (e.g. 'user-join' or 'message-send')
    
        * `data` (type: dictionary): The data to be sent to the websocket server
        
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

Just like with socket.io, `.on` is used to take client-side actions and `.emit` is used to send messages to the server.
