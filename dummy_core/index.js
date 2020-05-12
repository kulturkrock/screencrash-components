const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', function connection(ws) {

    console.log("Got connection!");

    ws.on('message', async function incoming(data) {
        // Uncomment to test messages FROM client (may do it hard to enter commands)
        let arrData = data.split(",").map(x => parseInt(x));
        if (arrData[0] == 0x00 && arrData[arrData.length-1] == 0xFF){
            let text = arrData.splice(1, arrData.length-2).map(x => String.fromCharCode(x)).join("");
            let obj = JSON.parse(text);
            console.log(JSON.stringify(obj));
        } else {
            console.log("Received invalid data: %s", data);
        }
    });
});

/* Joinked from stack overflow. Appears on multiple places
   so I dont really know who to give cred to */
function toUTF8Array(str) {
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

var stdin = process.openStdin();

stdin.addListener("data", function(d) {
    try{
        // Get input
        const input = d.toString().trim();
        // Validate that it is JSON
        const cmd = JSON.parse(input);

        // Construct output message
        const output = toUTF8Array(input);
        output.unshift(0x00);
        output.push(0xFF);

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