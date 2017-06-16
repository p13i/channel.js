var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// MIT License:
//
// Copyright (c) 2010-2012, Joe Walnes
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
/**
 * This behaves like a WebSocket in every way, except if it fails to connect,
 * or it gets disconnected, it will repeatedly poll until it succesfully connects
 * again.
 *
 * It is API compatible, so when you have:
 *   ws = new WebSocket('ws://....');
 * you can replace with:
 *   ws = new ReconnectingWebSocket('ws://....');
 *
 * The event stream will typically look like:
 *  onconnecting
 *  onopen
 *  onmessage
 *  onmessage
 *  onclose // lost connection
 *  onconnecting
 *  onopen  // sometime later...
 *  onmessage
 *  onmessage
 *  etc...
 *
 * It is API compatible with the standard WebSocket API.
 *
 * Latest version: https://github.com/joewalnes/reconnecting-websocket/
 * - Joe Walnes
 *
 * Latest TypeScript version: https://github.com/daviddoran/typescript-reconnecting-websocket/
 * - David Doran
 */
var ReconnectingWebSocket = (function () {
    function ReconnectingWebSocket(url, protocols) {
        if (protocols === void 0) { protocols = []; }
        //These can be altered by calling code
        this.debug = false;
        //Time to wait before attempting reconnect (after close)
        this.reconnectInterval = 1000;
        //Time to wait for WebSocket to open (before aborting and retrying)
        this.timeoutInterval = 2000;
        //Whether WebSocket was forced to close by this client
        this.forcedClose = false;
        //Whether WebSocket opening timed out
        this.timedOut = false;
        //List of WebSocket sub-protocols
        this.protocols = [];
        //Set up the default 'noop' event handlers
        this.onopen = function (event) { };
        this.onclose = function (event) { };
        this.onconnecting = function () { };
        this.onmessage = function (event) { };
        this.onerror = function (event) { };
        this.url = url;
        this.protocols = protocols;
        this.readyState = WebSocket.CONNECTING;
        this.connect(false);
    }
    ReconnectingWebSocket.prototype.connect = function (reconnectAttempt) {
        var _this = this;
        this.ws = new WebSocket(this.url, this.protocols);
        this.onconnecting();
        this.log('ReconnectingWebSocket', 'attempt-connect', this.url);
        var localWs = this.ws;
        var timeout = setTimeout(function () {
            _this.log('ReconnectingWebSocket', 'connection-timeout', _this.url);
            _this.timedOut = true;
            localWs.close();
            _this.timedOut = false;
        }, this.timeoutInterval);
        this.ws.onopen = function (event) {
            clearTimeout(timeout);
            _this.log('ReconnectingWebSocket', 'onopen', _this.url);
            _this.readyState = WebSocket.OPEN;
            reconnectAttempt = false;
            _this.onopen(event);
        };
        this.ws.onclose = function (event) {
            clearTimeout(timeout);
            _this.ws = null;
            if (_this.forcedClose) {
                _this.readyState = WebSocket.CLOSED;
                _this.onclose(event);
            }
            else {
                _this.readyState = WebSocket.CONNECTING;
                _this.onconnecting();
                if (!reconnectAttempt && !_this.timedOut) {
                    _this.log('ReconnectingWebSocket', 'onclose', _this.url);
                    _this.onclose(event);
                }
                setTimeout(function () {
                    _this.connect(true);
                }, _this.reconnectInterval);
            }
        };
        this.ws.onmessage = function (event) {
            _this.log('ReconnectingWebSocket', 'onmessage', _this.url, event.data);
            _this.onmessage(event);
        };
        this.ws.onerror = function (event) {
            _this.log('ReconnectingWebSocket', 'onerror', _this.url, event);
            _this.onerror(event);
        };
    };
    ReconnectingWebSocket.prototype.send = function (data) {
        if (this.ws) {
            this.log('ReconnectingWebSocket', 'send', this.url, data);
            return this.ws.send(data);
        }
        else {
            throw 'INVALID_STATE_ERR : Pausing to reconnect websocket';
        }
    };
    /**
     * Returns boolean, whether websocket was FORCEFULLY closed.
     */
    ReconnectingWebSocket.prototype.close = function () {
        if (this.ws) {
            this.forcedClose = true;
            this.ws.close();
            return true;
        }
        return false;
    };
    /**
     * Additional public API method to refresh the connection if still open (close, re-open).
     * For example, if the app suspects bad data / missed heart beats, it can try to refresh.
     *
     * Returns boolean, whether websocket was closed.
     */
    ReconnectingWebSocket.prototype.refresh = function () {
        if (this.ws) {
            this.ws.close();
            return true;
        }
        return false;
    };
    ReconnectingWebSocket.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.debug || ReconnectingWebSocket.debugAll) {
            console.debug.apply(console, args);
        }
    };
    return ReconnectingWebSocket;
}());
/**
 * Setting this to true is the equivalent of setting all instances of ReconnectingWebSocket.debug to true.
 */
ReconnectingWebSocket.debugAll = false;
/// <reference path="references.ts"/>
/**
 * CHANNEL.JS - a simple Javascript front-end for Django Channels websocket applications
 *
 * This software is provided under the MIT License.
 *
 * @author PRAMOD KOTIPALLI [http://pramodk.net/, http://github.com/k-pramod]
 * @version 0.2.0
 */
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
        if (pathType === void 0) { pathType = 'relative'; }
        var _this = this;
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
                    var event_1 = BindingAgent.getBindingAgentKey(data.stream, payload.action);
                    data = payload.data;
                    data.model = payload.model;
                    data.pk = payload.pk;
                    _innerThis.callUponClient(event_1, data, data.stream);
                }
                else if (data.event) {
                    var event_2 = data['event'];
                    delete data['event'];
                    _innerThis.callUponClient(event_2, data);
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
    return BindingAgent;
}());
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
/**
 * Errors from sockets.
 */
var ChannelError = (function (_super) {
    __extends(ChannelError, _super);
    function ChannelError(message) {
        var _this = _super.call(this, message) || this;
        _this.message = message;
        _this.name = 'ChannelError';
        return _this;
    }
    return ChannelError;
}(Error));
/// <reference path="reconnecting-websocket.ts"/>
/// <reference path="channel.ts"/>
