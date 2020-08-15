const express = require('express');
const http = require('http');
const ws = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new ws.Server({ server: server });

const webPort = 8080;
const socketPort = 8081;




// WebSocket listener
wss.on('connection', (socket, request) => {
	// Send Callback
	socket.send("Callback.. Hellooo!");

	console.log(`${request.connection.address} connected!`);

	// Add a simple message event
	socket.on('message', (message) => {
		// Log the received message and send it back to the client
		console.log('received: %s', message);

		// Broadcast message to everyone 
		wss.clients.forEach(client => {
			client.send(`Hello, broadcast message -> ${message}`);
		});
	});

});

//Static server
app.use(express.static("dist/public"));

app.get('/', (req, res) => {
	res.sendFile("/dist/index.html", {root: __dirname + "/../"});
});


// Seting up servers
app.listen(webPort, () => {
	console.log(`Normal server open on port ${webPort}!`);
});

server.listen(socketPort, () => {
	console.log(`Websocket server open on port ${socketPort}!`);
})