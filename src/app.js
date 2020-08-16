const express = require('express');
const http = require('http');
const ws = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new ws.Server({ server: server });

const webPort = 8080;


// WebSocket listener
wss.on('connection', (ws) => {
	var data = {
		event: "handshake",
		data: "hello! C:"
	};

	// Send Callback
	ws.send(JSON.stringify(data));

	console.log('WS Connection from %s:%d', ws._socket.remoteAddress, ws._socket.remotePort);

	// Add a simple message event
	ws.on('message', (message) => {
		data = JSON.parse(message);

		// Log the received message and send it back to the client
		console.log('Received: %s', message);

		// Add timestamp
		data.timestamp = new Date().getTime() + 500;

		// Broadcast data to everyone 
		wss.clients.forEach(client => {
			client.send(JSON.stringify(data));
		});
	});

});



//Static server
app.use(express.static("dist/public"));

app.get('/', (req, res) => {
	res.sendFile("/dist/index.html", {root: __dirname + "/../"});
});



// Seting up server
server.listen(webPort, () => {
	console.log(`Server opened on port ${webPort}!`);
})