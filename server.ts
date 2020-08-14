import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';


const app = express.default();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const webPort = 8080;
const socketPort = 8081;



// WebSocket listener
wss.on('connection', (ws: WebSocket) => {
	// Send Callback
	ws.send("Callback.. Hellooo!");

	// Add a simple message event
	ws.on('message', (message: string) => {
		// Log the received message and send it back to the client
		console.log('received: %s', message);

		// Broadcast message to everyone 
		wss.clients.forEach(client => {
			client.send(`Hello, broadcast message -> ${message}`);
		});
	});

});

//Static server
app.use(express.static("public"));

app.get('/', (req, res) => {
	res.sendFile(__dirname + "/static/main.html");
});

app.listen(webPort, () => {
	console.log(`App listening on port ${webPort}!`);
});
server.listen(socketPort, () => {
	console.log(`Web Socket server started on port ${socketPort} :)`);
});
