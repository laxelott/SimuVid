require("./modules/hashCode");

const express = require('express');
const http = require('http');
const fs = require('fs');
const parser = require('body-parser');

const app = express();
const webPort = 8080;

var channels = require('./modules/channels');

// Set the view engine to ejs
app.set('view engine', 'ejs');
// Set views path
app.set("views", __dirname + "/../dist/pages");

// Initialize channels module
channels = channels(app);
channels.logFunction = addToLogFile;



// FUNCTIONS
// Logging function
function addToLogFile(line) {
	console.log(line);
	date = new Date().toLocaleString("en-GB", { timeZone: "America/Mexico_City" });
	fs.appendFile("server.log", `[${date}] > ${line}\n`, (err) => {
		if (err) throw err;
	});
}



// SERVER SET-UP
addToLogFile("Setting up...");

// Static server
app.use(express.static("dist/public"));



// REQUESTS
// index.html
app.get('/', (req, res) => {
	res.render("index");
});

// Channel creation
app.post('/create/channel/', parser.urlencoded({ extended: false }), (req, res) => {
    console.log('Got body:', req.body);

	var channelName = req.body.name;
	var channelPassword = req.body.name;

	res.end(JSON.stringify( channels.createChannel(channelName, channelPassword)));
});

// Channels
app.get('/channel/:channelName', (req, res) => {
	var channelName = req.params.channelName;
	var channelPassword = req.query.pwd;
	var args;

	console.log("Channel accessed! (%s) with password: %s", channelName, channelPassword);


	if(channels.validateChannel(channelName, channelPassword)) {
		console.log(`Rendering '${channelName}' (${channelPassword})...`);

		res.render("channel", {
			channelName: channelName,
			channelPassword: channelPassword
		});
	} else {
		res.render("index", {
			alert: true,
			alertMode: 'error',
			alertText: 'Invalid channel!'
		});
	}
});

app.listen(webPort, () => {
	console.log(`Server opened on port ${webPort}!`);
})

// Exit actions
process.on("exit", function () {
	addToLogFile("Exiting...");
})