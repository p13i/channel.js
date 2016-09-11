/**
 * CHANNEL.JS - a simple Javascript front-end for Django Channels websocket applications
 *
 * This software is provided under the MIT License.
 *
 * @author PRAMOD KOTIPALLI [http://pramodk.net/, http://github.com/k-pramod]
 * @version 0.2.0
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Provides simple Javascript API for sending and receiving messages from web servers running Django Channel
 */
var Channel = (function () {
    /**
     * Constructs a new Channel
     *
     * @param webSocketPath
     *      The path on the server. The path should be specified **relative** to the host.
     *      For example, if your server is listening at http://ws.pramodk.net/chat/myRoomName/,
     *      you must provide the websocketPath as `'/chat/myRoomName/'`
     *      This approach eliminates the potential of CORS-related issues.
     * @param pathType
     *      Tell what the type of the path is.
     *      Set to 'absolute' if you would like to send into the entire path of the websocket
     */
    function Channel(webSocketPath, pathType) {
        var _this = this;
        if (pathType === void 0) { pathType = 'relative'; }
        /** The client-specified functions that are called with a particular event is received */
        this._clientConsumers = {
            // By default, we must specify the 'connect' consumer
            'connect': function (socket) {
                console.info('Connected to Channel ' + socket._webSocketPath, socket);
            },
            // And also the 'disconnect' consumer
            'disconnect': function (socket) {
                console.info('Disconnected from WebSocket', socket);
            }
        };
        /**
         * [Private method] Connects to the specified socket
         * If you would like to connect to a websocket not hosted on your server
         *
         * @param wsPath
         *          The absolute path of the server socket
         */
        this.connectTo = function (wsPath) {
            _this._socket = new ReconnectingWebSocket(wsPath);
            _this._webSocketPath = wsPath;
            var _innerThis = _this;
            // Hook up onopen event
            _this._socket.onopen = function () {
                _innerThis.callUponClient('connect', _innerThis);
            };
            // Hook up onclose event
            _this._socket.onclose = function () {
                _innerThis.callUponClient('disconnect', _innerThis);
            };
            // Hook up onmessage to the event specified in _clientConsumers
            _this._socket.onmessage = function (message) {
                var data = JSON.parse(message['data']);
                if (data.stream) {
                    var payload = data.payload;
                    var event = BindingAgent.getBindingAgentKey(data.stream, payload.action);
                    data = payload.data;
                    data.model = payload.model;
                    data.pk = payload.pk;
                    _innerThis.callUponClient(event, data, data.stream);
                }
                else if (data.event) {
                    var event = data['event'];
                    delete data['event'];
                    _innerThis.callUponClient(event, data);
                }
                throw new ChannelError("Unknown action expected of client.");
            };
        };
        /**
         * [Private method] Calls upon the relevant action within _clientConsumers
         *
         * @param event The name of the event
         * @param data The data to send to the consuming function
         * @param eventDisplayName The name of the event to print if there is an error (used in data binding calls)
         */
        this.callUponClient = function (event, data, eventDisplayName) {
            if (eventDisplayName === void 0) { eventDisplayName = event; }
            if (!(event in _this._clientConsumers)) {
                throw new ChannelError("\"" + eventDisplayName + "\" not is a registered event."
                    + "Registered events include: "
                    + _this.getRegisteredEvents().toString() + ". "
                    + "Have you setup up "
                    + "socket_instance.on('eventName', consumer_function) ?");
            }
            _this._clientConsumers[event](data);
        };
        /**
         * Handles messages from the server
         *
         * @param event The name of the event to listen to
         * @param clientFunction The client-side Javascript consumer function to call
         */
        this.on = function (event, clientFunction) {
            _this._clientConsumers[event] = clientFunction;
        };
        /**
         * Sends a message to the socket server
         *
         * @param event The name of the event to send to the socket server
         * @param data The data to send
         */
        this.emit = function (event, data) {
            data['event'] = event;
            _this._socket.send(JSON.stringify(data));
        };
        /**
         * Allows users to call .create, .update, and .destroy functions for data binding
         * @param streamName The name of the stream to bind to
         * @returns {BindingAgent} A new BindingAgent instance that takes care of registering the three events
         */
        this.bind = function (streamName) {
            return new BindingAgent(_this, streamName);
        };
        var absolutePath;
        if (pathType == 'relative') {
            var socketScheme = window.location.protocol == "https:" ? "wss" : "ws";
            absolutePath = socketScheme + '://' + window.location.host + webSocketPath;
        }
        else if (pathType == 'absolute') {
            absolutePath = webSocketPath;
        }
        else {
            throw new ChannelError('Invalid pathType chosen');
        }
        this.connectTo(absolutePath);
    }
    Channel.prototype.getRegisteredEvents = function () {
        return Object.keys(this._clientConsumers);
    };
    ;
    return Channel;
}());
/**
 * Allows for client to register create, update, and destroy functions for data binding.
 * Example:
 *      var bindingChannel = new Channel('/binding/');
 *      bindingChannel.bind('room')
 *          .create(function(data) { ... })
 *          .update(function(data) { ... })
 *          .destroy(function(data) { ... })
 */
var BindingAgent = (function () {
    /**
     * Constructor for the BindingAgent helper class.
     * @param channel The Channel that this class is helping.
     * @param streamName The name of the stream that this binding agent is supporting.
     */
    function BindingAgent(channel, streamName) {
        var _this = this;
        this._streamName = null;
        /**
         * Registers a binding client consumer function
         * @param bindingAction The name of the action to register
         * @param clientFunction The function to register
         */
        this.registerConsumer = function (bindingAction, clientFunction) {
            if (BindingAgent.ACTIONS.indexOf(bindingAction) == -1) {
                throw new ChannelError("You are trying to register an invalid action: "
                    + bindingAction
                    + ". Valid actions are: " +
                    BindingAgent.ACTIONS.toString());
            }
            var bindingAgentKey = BindingAgent.getBindingAgentKey(_this._streamName, bindingAction);
            _this._channel.on(bindingAgentKey, clientFunction);
        };
        this.create = function (clientFunction) {
            _this.registerConsumer('create', clientFunction);
            return _this;
        };
        this.update = function (clientFunction) {
            _this.registerConsumer('update', clientFunction);
            return _this;
        };
        this.destroy = function (clientFunction) {
            _this.registerConsumer('delete', clientFunction);
            return _this;
        };
        this._channel = channel;
        this._streamName = streamName;
    }
    // The valid actions for users to call bind
    BindingAgent.ACTIONS = ['create', 'update', 'delete'];
    BindingAgent.GLUE = "559c09b44d6ff51559f14e87ad2b79ce"; // Hash of "http://pramodk.net" (^-^)
    /**
     * Gets the dictionary key used to call binding functions
     * @param streamName The name of the stream
     * @param action The name of the action
     * @returns {string} A key that can be used to set and search keys in the Channel._clientConsumers dictionary
     */
    BindingAgent.getBindingAgentKey = function (streamName, action) {
        // Using the GLUE variable ensures that no regular event register with .on conflicts with the binding event
        return streamName + " - " + BindingAgent.GLUE + " - " + action;
    };
    return BindingAgent;
}());
/**
 * Errors from sockets.
 */
var ChannelError = (function (_super) {
    __extends(ChannelError, _super);
    function ChannelError(message) {
        _super.call(this, message);
        this.message = message;
        this.name = 'ChannelError';
    }
    return ChannelError;
}(Error));
