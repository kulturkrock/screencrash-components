const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', function connection(ws) {

    console.log("Got connection!");

    ws.on('message', async function incoming(data) {
        try {
            const obj = JSON.parse(data);
            // Uncomment to test messages FROM client (may do it hard to enter commands)
            // console.log(JSON.stringify(obj));
        } catch(e){
            console.log(`Received invalid data: {data}`);
        }
    });
});

const stdin = process.openStdin();

stdin.addListener("data", function(d) {
    try{
        // Get input
        const input = d.toString().trim();
        // Validate that it is JSON
        const cmd = JSON.parse(input);
        const output = JSON.stringify(cmd);

        // Send to all
        let count = 0;
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(output);
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