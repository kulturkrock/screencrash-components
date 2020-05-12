const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', function connection(ws) {

    console.log("Got connection!");

    ws.on('message', function incoming(message) {
        console.log('Received: %s', message);
    });
});

var stdin = process.openStdin();

stdin.addListener("data", function(d) {
    try{
        // Get input
        const input = d.toString().trim();
        // Validate that it is JSON
        const cmd = JSON.parse(input);

        // Send to all
        let count = 0;
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(input);
                count++;
            }
        });

        // Acknowledge send status
        console.log("Message sent to %d/%d clients", count, wss.clients.size);
    } catch(e) {
        console.log("Could not send to clients: " + e.message);
    }
});

console.log("Running WS server on port 3000, enter valid JSON to send to all clients");