
module.exports = class CoreConnection {

    constructor(address, reconnect = true, reconnectWait = 3000){
        this.address = address;
        this.reconnect = reconnect;
        this.reconnectWait = reconnectWait;
        this.connect();
    }

    connect(){
        this.socket = new WebSocket(this.address);
        this.socket.addEventListener("open", this.onConnected.bind(this));
        this.socket.addEventListener("message", this.onMessage.bind(this));
        this.socket.addEventListener("close", this.onDisconnected.bind(this));
    }

    onConnected(event){
        console.log("Connected to server: " + event.target.url);
    }

    onMessage(event){
        const msg = JSON.parse(event.data);
        console.log("Got message: ");
        console.log(msg);
    }

    onDisconnected(event){
        if (!event.wasClean){
            if (this.reconnect){
                console.log("Trying to reconnect in %d ms", this.reconnectWait);
                setTimeout(this.connect.bind(this), this.reconnectWait);
            } else{
                console.log("Unexpectedly lost connection");
            }
        } else {
            console.log("Disconnected from server");
        }
    }
}