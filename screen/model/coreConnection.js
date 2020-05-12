
module.exports = class CoreConnection {

    constructor(address, onMessageCallback = null, reconnect = true, reconnectWait = 3000){
        this.address = address;
        this.onMessageCallback = onMessageCallback;
        this.reconnect = reconnect;
        this.reconnectWait = reconnectWait;
        this.socket = null;
        this.heartbeatInterval = null;
        this.connect();
    }

    connect(){

        if (this.heartbeatInterval != null){
            clearInterval(this.heartbeatInterval);
        }

        this.socket = new WebSocket(this.address);
        this.socket.addEventListener("open", this.onConnected.bind(this));
        this.socket.addEventListener("message", this.onMessage.bind(this));
        this.socket.addEventListener("close", this.onDisconnected.bind(this));

        // TODO: Adjust time according to spec
        this.heartbeatInterval = setInterval(this._sendHeartbeat.bind(this), 1000);
    }

    send(dataObj){
        let output = this._dataToUTF8Array(JSON.stringify(dataObj));
        output.unshift(0x00);
        output.push(0xFF);
        this.socket.send(output);
    }

    onConnected(event){

        console.log("Connected to server: " + event.target.url);
        this.send(this._getAnnounceMessage());
    }

    async onMessage(event){

        let msg = await this._extractData(event.data);
        if (msg != null){
            if (this.onMessageCallback){
                this.onMessageCallback(msg);
            } else{
                console.log("Got message: ");
                console.log(msg);

            }
        } else {
            console.log("Warning: Got badly formatted message");
        }
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

    _getAnnounceMessage(){
        return {
            "type": "announce",
            "component": "screen",
            "channel": 1
        };
    }

    _getHeartbeatMessage(){
        return {
            "type": "heartbeat",
            "component": "screen",
            "channel": 1
        };
    }

    _sendHeartbeat(){

        if (this.socket != null && this.socket.readyState === WebSocket.OPEN){
            this.send(this._getHeartbeatMessage());
        }
    }

    async _extractData(blob){

        let data = await blob.arrayBuffer();
        let view = new Int8Array(data);

        // Make sure the formatting follows the spec
        if (view[0] == 0x00 && view[view.length-1] == -1 /* 0xFF */) {
            // Extract message
            const strMessage = await new Response(blob.slice(1, blob.size-1)).text();
            return JSON.parse(strMessage);
        }

        return null;
    }

    
    /* Joinked from stack overflow. Appears on multiple places
    so I dont really know who to give cred to */
    _dataToUTF8Array(str) {
        let utf8 = [];
        for (let i = 0; i < str.length; i++) {
            let charcode = str.charCodeAt(i);
            if (charcode < 0x80) utf8.push(charcode);
            else if (charcode < 0x800) {
                utf8.push(0xc0 | (charcode >> 6),
                        0x80 | (charcode & 0x3f));
            }
            else if (charcode < 0xd800 || charcode >= 0xe000) {
                utf8.push(0xe0 | (charcode >> 12),
                        0x80 | ((charcode>>6) & 0x3f),
                        0x80 | (charcode & 0x3f));
            }
            // surrogate pair
            else {
                i++;
                // UTF-16 encodes 0x10000-0x10FFFF by
                // subtracting 0x10000 and splitting the
                // 20 bits of 0x0-0xFFFFF into two halves
                charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                        | (str.charCodeAt(i) & 0x3ff));
                utf8.push(0xf0 | (charcode >>18),
                        0x80 | ((charcode>>12) & 0x3f),
                        0x80 | ((charcode>>6) & 0x3f),
                        0x80 | (charcode & 0x3f));
            }
        }
        return utf8;
    }
}