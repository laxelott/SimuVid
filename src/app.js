const express = require('express');
const fs = require('fs');
const parser = require('body-parser');
const utilities = require("./modules/util");

const app = express();
const webPort = 8080;

const http = require('http').createServer(app);
const channels = require('./modules/channels')(http);


// Set the view engine to ejs
app.set('view engine', 'ejs');
// Set views path
app.set("views", __dirname + "/../dist/pages");

// Initialize channels module
channels.logFunction = addToLogFile;



// FUNCTIONS
// Logging function
function addToLogFile(line) {
	console.log(line);
	date = new Date().toLocaleString("en-GB", { timeZone: "America/Panama" });
	fs.appendFile("server.log", `[${date}] > ${line}\n`, (err) => {
		if (err) throw err;
	});
}



// SERVER SET-UP
addToLogFile("Setting up...");

// Static server
app.use(express.static("dist/public"));



// REQUESTS
// "static" pages
app.get('/', (req, res) => {
	res.render("index");
});
app.get('/what-to-do', (req, res) => {
	res.render("instructions");
});



// General channel page
app.get('/channel/:channelName', (req, res) => {
	var channelName = req.params.channelName;
	var channelPassword = req.query.pwd;
	var validation = channels.validateChannel(channelName, channelPassword);

	if (validation.valid) {
		res.render("channel", {
			channelName: channelName,
			channelPassword: channelPassword
		});
	} else {
		res.render("index", {
			alert: true,
			alertMode: 'error',
			alertText: validation.message
		});
	}
});
// Channel information
app.post('/get/channel/', parser.urlencoded({ extended: false }), (req, res) => {
	var channelName = req.body.name;
	var channelPassword = req.body.password;
	var validation;
	var response = {
		valid: false,
		message: 'no-message'
	};

	channelPassword = utilities.processPassword(channelName + channelPassword);
	validation = channels.validateChannel(channelName, channelPassword);

	console.log(channelName);
	console.log(channelPassword);

	if (validation.valid) {
		// Give out the channel's info
		response.valid = true;
		response.name = channelName;
		response.password = channelPassword;
	} else {
		response.message = validation.message;
	}

	res.end(JSON.stringify(response));
});
// Channel creation
app.post('/create/channel/', parser.urlencoded({ extended: false }), (req, res) => {
	var channelName = req.body.name;
	var channelPassword = req.body.password;
	var response = channels.createChannel(channelName, channelPassword);

	res.end(JSON.stringify(response));

	if (!response.error) {
		channels.queueRemoveChannel(channelName, 5000);
	}
});

http.listen(webPort, () => {
	console.log(`Server opened on port ${webPort}!`);
})

// Exit actions
process.on("exit", function () {
	addToLogFile("Exiting...");
})