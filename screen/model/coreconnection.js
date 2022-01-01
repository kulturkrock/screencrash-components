
module.exports = class CoreConnection {

    constructor(address, onMessageCallback = null, reconnect = true, reconnectWait = 3000) {
        this.address = address;
        this.onMessageCallback = onMessageCallback;
        this.reconnect = reconnect;
        this.reconnectWait = reconnectWait;
        this.socket = null;
        this.heartbeatInterval = null;
        this.connect();
    }

    connect() {
        if (this.heartbeatInterval != null) {
            clearInterval(this.heartbeatInterval);
        }

        this.socket = new WebSocket(this.address);
        this.socket.addEventListener('open', this.onConnected.bind(this));
        this.socket.addEventListener('message', this.onMessage.bind(this));
        this.socket.addEventListener('close', this.onDisconnected.bind(this));

        // TODO: Adjust time according to spec
        this.heartbeatInterval = setInterval(this._sendHeartbeat.bind(this), 1000);
    }

    send(dataObj) {
        if (this.socket) {
            this.socket.send(JSON.stringify(dataObj));
        }
    }

    onConnected(event) {
        console.log('Connected to server: ' + event.target.url);
        this.send(this._getAnnounceMessage());
    }

    onMessage(event) {
        const msg = JSON.parse(event.data);
        if (msg != null) {
            if (this.onMessageCallback) {
                this.onMessageCallback(msg);
            } else {
                console.log('Got unhandled message: ');
                console.log(msg);
            }
        } else {
            console.log('Warning: Got badly formatted message');
        }
    }

    onDisconnected(event) {
        this.socket = null;
        if (!event.wasClean) {
            if (this.reconnect) {
                console.log('Trying to reconnect in %d ms', this.reconnectWait);
                setTimeout(this.connect.bind(this), this.reconnectWait);
            } else {
                console.log('Unexpectedly lost connection');
            }
        } else {
            console.log('Disconnected from server');
        }
    }

    _getAnnounceMessage() {
        return {
            type: 'announce',
            client: 'screen',
            channel: 1
        };
    }

    _getHeartbeatMessage() {
        return {
            messageType: 'heartbeat',
            component: 'screen',
            channel: 1
        };
    }

    _sendHeartbeat() {
        if (this.socket != null && this.socket.readyState === WebSocket.OPEN) {
            this.send(this._getHeartbeatMessage());
        }
    }

};
