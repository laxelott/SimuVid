const express = require('express');
const http = require('http');
const ws = require('ws');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new ws.Server({ server: server });

const webPort = 8080;
var date;


// Logging function
function addToLogFile(line) {
	console.log(line);
	date = new Date().toLocaleString("en-GB", { timeZone: "America/Mexico_City" });
	fs.appendFile("server.log", `[${date}] > ${line}\n`, (err) => {
		if (err) throw err;
	});
}

addToLogFile("Starting...");

// WebSocket listener
wss.on('connection', (ws) => {
	var data = {
		event: "handshake",
		data: "hello! C:"
	};

	// Send Callback
	ws.send(JSON.stringify(data));

	// Log event
	addToLogFile(`WS Connection from ${ws._socket.remoteAddress}:${ws._socket.remotePort}`);

	// Broadcast message event
	ws.on('message', (message) => {
		data = JSON.parse(message);

		// Log message
		addToLogFile(`Recieved: ${message}`);

		// Add timestamp
		data.timestamp = new Date().getTime() + 500;

		// Broadcast message to everyone 
		wss.clients.forEach(client => {
			client.send(JSON.stringify(data));
		});
	});

});



//Static server
app.use(express.static("dist/public"));

app.get('/', (req, res) => {
	res.sendFile("/dist/index.html", { root: __dirname + "/../" });
});



// Seting up server
server.listen(webPort, () => {
	console.log(`Server opened on port ${webPort}!`);
})



// Exit actions
process.on("exit", function () {
	addToLogFile("Exiting...");
})