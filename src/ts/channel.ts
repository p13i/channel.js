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
    on:(event:string, clientFunction:(data:{[key:string]:string}) => void) => void;

    /**
     * Sends a message to the web socket server
     * @param command The string name of the task being commanded of the server
     * @param data The data dictionary to send to the server
     */
    emit:(command:string, data:{}) => void;
}

/**
 * Errors from sockets.
 */
class ChannelError extends Error {
    public name = "ChannelError";

    constructor(public message?:string) {
        super(message);
    }
}

/**
 * Provides simple Javascript API for sending and receiving messages from web servers running Django Channel
 */
export class Channel implements ChannelInterface {
    /** The actual WebSocket connecting with the Django Channels server */
    public _socket:WebSocket;

    /** The client-specified functions that are called with a particular event is received */
    private _clientConsumers:{[action:string]:((data:any) => void)} = {
        // By default, we must specify the 'connect' consumer
        'connect': function (socket:Channel) {
            console.info('Connected to WebSocket', socket);
        },
        // And also the 'disconnect' consumer
        'disconnect': function (socket:Channel) {
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
    constructor(webSocketPath:string, pathType:string = 'relative') {
        var absolutePath;
        if (pathType == 'relative') {
            var socketScheme = window.location.protocol == "https:" ? "wss" : "ws";
            absolutePath = socketScheme + '://' + window.location.host + webSocketPath;
        } else if (pathType == 'absolute') {
            absolutePath = webSocketPath;
        } else {
            throw new Error('Invalid pathType chosen');
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
    private connectTo = (wsPath:string) => {
        this._socket = new ReconnectingWebSocket(wsPath);

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
            var event = data['event'];

            delete data['event'];

            _innerThis.callUponClient(event, data);
        }
    };

    /**
     * [Private method] Calls upon the relevant action within _clientConsumers
     *
     * @param event The name of the event
     * @param data The data to send to the consuming function
     */
    private callUponClient = (event:string, data:any) => {
        if (!(event in this._clientConsumers)) {
            throw new ChannelError(
                "\"" + event + "\" not is a registered event."
                + "Registered events include: "
                + this.getRegisteredEvents().toString() + ". "
                + "Have you setup up socket_instance.on('event_name', consumer_function) ?"
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
    on = (event:string, clientFunction:(data)=>void) => {
        this._clientConsumers[event] = clientFunction;
    };

    /**
     * Sends a message to the socket server
     *
     * @param command The name of the command to send to the socket server
     * @param data The data to send
     */
    emit = (command:string, data:{}) => {
        data['command'] = command;
        this._socket.send(JSON.stringify(data));
    };
}

/**
 * Interface for WebSocket (ReconnectingWebSocket)
 */
interface WebSocket {
    /**
     * Constructor for WebSocket
     * @param wsPath The path of the websocket on the internet
     */
    new(wsPath:string);

    /**
     * Function called when socket is opened.
     */
    onopen():void;
    /**
     * Called when socket is closed.
     */
    onclose():void;
    /**
     * Called when the socket receives a message.
     * @param data The JSON data string received from the server
     */
    onmessage(data:string):void;

    /**
     * Sends data to the server through the web socket
     * @param data The data JSON string to be send to the server
     */
    send(data:string):void;
}

/**
 * reconnecting-websocket.js is the web socket API used behind the scenes
 */
declare var ReconnectingWebSocket:WebSocket;