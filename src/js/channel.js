var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Errors from sockets.
 */
var ChannelError = (function (_super) {
    __extends(ChannelError, _super);
    function ChannelError(message) {
        _super.call(this, message);
        this.message = message;
        this.name = "ChannelError";
    }
    return ChannelError;
}(Error));
/**
 * Provides simple Javascript API for sending and receiving messages from web servers running Django Channel
 *
 * @author Pramod Kotipalli
 * @version 0.1.0
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
                console.info('Connected to WebSocket', socket);
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
                var event = data['event'];
                delete data['event'];
                _innerThis.callUponClient(event, data);
            };
        };
        /**
         * [Private method] Calls upon the relevant action within _clientConsumers
         *
         * @param event The name of the event
         * @param data The data to send to the consuming function
         */
        this.callUponClient = function (event, data) {
            if (!(event in _this._clientConsumers)) {
                throw new ChannelError("\"" + event + "\" not is a registered event."
                    + "Registered events include: "
                    + _this.getRegisteredEvents().toString() + ". "
                    + "Have you setup up socket_instance.on('event_name', consumer_function) ?");
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
         * @param command The name of the command to send to the socket server
         * @param data The data to send
         */
        this.emit = function (command, data) {
            data['command'] = command;
            _this._socket.send(JSON.stringify(data));
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
            throw new Error('Invalid pathType chosen');
        }
        this.connectTo(absolutePath);
    }
    Channel.prototype.getRegisteredEvents = function () {
        return Object.keys(this._clientConsumers);
    };
    ;
    return Channel;
}());
