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
class Channel implements ChannelInterface {
    /** The actual WebSocket connecting with the Django Channels server */
    public _socket: ReconnectingWebSocket;
    public _webSocketPath: string;

    /** The client-specified functions that are called with a particular event is received */
    private _clientConsumers: {[action: string]: ((data: any) => void)} = {
        // By default, we must specify the 'connect' consumer
        'connect': function (socket: Channel) {
            console.info('Connected to Channel ' + socket._webSocketPath, socket);
        },
        // And also the 'disconnect' consumer
        'disconnect': function (socket: Channel) {
            console.info('Disconnected from WebSocket', socket);
        }
    };

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
    constructor(webSocketPath: string, pathType: string = 'relative') {
        var absolutePath;
        if (pathType == 'relative') {
            var socketScheme = window.location.protocol == "https:" ? "wss" : "ws";
            absolutePath = socketScheme + '://' + window.location.host + webSocketPath;
        } else if (pathType == 'absolute') {
            absolutePath = webSocketPath;
        } else {
            throw new ChannelError('Invalid pathType chosen');
        }
        this.connectTo(absolutePath);
    }

    /**
     * [Private method] Connects to the specified socket
     * If you would like to connect to a websocket not hosted on your server
     *
     * @param wsPath
     *          The absolute path of the server socket
     */
    private connectTo = (wsPath: string) => {
        this._socket = new ReconnectingWebSocket(wsPath);
        this._webSocketPath = wsPath;
        var _innerThis = this;

        // Hook up onopen event
        this._socket.onopen = function () {
            _innerThis.callUponClient('connect', _innerThis);
        };

        // Hook up onclose event
        this._socket.onclose = function () {
            _innerThis.callUponClient('disconnect', _innerThis);
        };

        // Hook up onmessage to the event specified in _clientConsumers
        this._socket.onmessage = function (message) {
            var data = JSON.parse(message['data']);

            if (data.stream) { // Handle data-binding call
                var payload = data.payload;
                var event = BindingAgent.getBindingAgentKey(data.stream, payload.action);
                data = payload.data;
                data.model = payload.model;
                data.pk = payload.pk;
                _innerThis.callUponClient(event, data, data.stream);

            } else if (data.event) { // A websocket regular event has been triggered
                var event: string = data['event'];
                delete data['event'];
                _innerThis.callUponClient(event, data);
            }
            throw new ChannelError("Unknown action expected of client.");
        }
    };

    /**
     * [Private method] Calls upon the relevant action within _clientConsumers
     *
     * @param event The name of the event
     * @param data The data to send to the consuming function
     * @param eventDisplayName The name of the event to print if there is an error (used in data binding calls)
     */
    private callUponClient = (event: string, data: any, eventDisplayName:string = event) => {
        if (!(event in this._clientConsumers)) {
            throw new ChannelError(
                "\"" + eventDisplayName + "\" not is a registered event."
                + "Registered events include: "
                + this.getRegisteredEvents().toString() + ". "
                + "Have you setup up "
                + "socket_instance.on('eventName', consumer_function) ?"
            );
        }
        this._clientConsumers[event](data);
    };

    private getRegisteredEvents() {
        return Object.keys(this._clientConsumers);
    };

    /**
     * Handles messages from the server
     *
     * @param event The name of the event to listen to
     * @param clientFunction The client-side Javascript consumer function to call
     */
    on = (event: string, clientFunction: (data) => void) => {
        this._clientConsumers[event] = clientFunction;
    };

    /**
     * Sends a message to the socket server
     *
     * @param event The name of the event to send to the socket server
     * @param data The data to send
     */
    emit = (event: string, data: {}) => {
        data['event'] = event;
        this._socket.send(JSON.stringify(data));
    };

    /**
     * Allows users to call .create, .update, and .destroy functions for data binding
     * @param streamName The name of the stream to bind to
     * @returns {BindingAgent} A new BindingAgent instance that takes care of registering the three events
     */
    bind = (streamName: string) => {
        return new BindingAgent(this, streamName);
    }
}

/**
 * Allows for client to register create, update, and destroy functions for data binding.
 * Example:
 *      var bindingChannel = new Channel('/binding/');
 *      bindingChannel.bind('room')
 *          .create(function(data) { ... })
 *          .update(function(data) { ... })
 *          .destroy(function(data) { ... })
 */
class BindingAgent {
    private _channel: Channel;
    private _streamName: string = null;

    /**
     * Constructor for the BindingAgent helper class.
     * @param channel The Channel that this class is helping.
     * @param streamName The name of the stream that this binding agent is supporting.
     */
    constructor(channel: Channel, streamName: string) {
        this._channel = channel;
        this._streamName = streamName;
    }

    // The valid actions for users to call bind
    private static ACTIONS = ['create', 'update', 'delete'];

    /**
     * Registers a binding client consumer function
     * @param bindingAction The name of the action to register
     * @param clientFunction The function to register
     */
    private registerConsumer = (bindingAction, clientFunction) => {
        if (BindingAgent.ACTIONS.indexOf(bindingAction) == -1) {
            throw new ChannelError(
                "You are trying to register an invalid action: "
                + bindingAction
                + ". Valid actions are: " +
                BindingAgent.ACTIONS.toString());
        }
        var bindingAgentKey = BindingAgent.getBindingAgentKey(this._streamName, bindingAction);
        this._channel.on(bindingAgentKey, clientFunction);
    };

    private static GLUE = "559c09b44d6ff51559f14e87ad2b79ce"; // Hash of "http://pramodk.net" (^-^)
    /**
     * Gets the dictionary key used to call binding functions
     * @param streamName The name of the stream
     * @param action The name of the action
     * @returns {string} A key that can be used to set and search keys in the Channel._clientConsumers dictionary
     */
    public static getBindingAgentKey = (streamName: string, action: string): string => {
        // Using the GLUE variable ensures that no regular event register with .on conflicts with the binding event
        return streamName + " - " + BindingAgent.GLUE + " - " + action;
    };

    public create = (clientFunction) => {
        this.registerConsumer('create', clientFunction);
        return this;
    };

    public update = (clientFunction) => {
        this.registerConsumer('update', clientFunction);
        return this;
    };

    public destroy = (clientFunction) => {
        this.registerConsumer('delete', clientFunction);
        return this;
    }
}

/**
 * Interface of Django Channels socket that emulates the behavior of NodeJS' socket.io
 * This project has only one dependency: ReconnectingWebSocket.js
 */
interface ChannelInterface {
    /**
     * Setup trigger for client-side function when the Channel receives a message from the server
     * @param event The 'event' received from the server
     * @param clientFunction The client-side Javascript function to call when the `event` is triggered
     */
    on: (event: string, clientFunction: (data: {[key: string]: string}) => void) => void;

    /**
     * Sends a message to the web socket server
     * @param event The string name of the task being commanded of the server
     * @param data The data dictionary to send to the server
     */
    emit: (event: string, data: {}) => void;
}

/**
 * Errors from sockets.
 */
class ChannelError extends Error {
    public name = 'ChannelError';
    constructor(public message: string) {
        super(message);
    }
}
