module.exports = function (http) {
	const io = require('socket.io')(http);
	const utilities = require("./util");

	this.openChannels = [];



	// Room and socket login
	io.on('connection', (socket) => {
		var name = socket.handshake.query.name;
		var password = socket.handshake.query.pwd;
		var data = {
			event: "handshake",
			data: "Hello! C:"
		};
		var validation = validateChannel(name, password);

		logFunction(`${socket.handshake.address} connecting -> ${name} (pw: ${password})`);

		// Check if channel is valid
		if (validation.valid) {
			// Join socket to relevant room
			socket.join(name);

			socket.on('message', (data) => {
				try {
					data = JSON.parse(data.data);
					
					// Log message
					logFunction(`Recieved: ${JSON.stringify(data)}`);

					// Add timestamp
					data.timestamp = new Date().getTime() + 500;

					// Broadcast player event to everyone in room
					io.in(name).emit('player', data);
				} catch (event) {
					logFunction(`Channel '${name}' tried to die! (${event})`);
				}
			});

			socket.on('disconnect', () => {
				logFunction(`${socket.handshake.address} disconnected from '${name}'`);

				// Try to close the channel in case this was the last socket there
				queueRemoveChannel(name, 5000);
			});
		} else {
			logFunction(validation.message);
		}
		// Send Handshake
		socket.emit('handshake', JSON.stringify(validation));

		if (!validation.valid) {
			socket.disconnect('true')	;
		}
	});



	this.logFunction = function (data) {
		console.log(data);
	};



	// CHANNEL MANAGEMENT
	this.createChannel = function (name, password) {
		var result = {
			error: 0,
			message: "No message"
		};

		// Only if channel is not registered
		if (openChannels.filter((channel) => { return channel.name == name }).length == 0) {
			if (validateChannelName(name)) {
				var channel = {
					name: name,
					password: utilities.processPassword(name + password)
				};

				openChannels.push(channel);

				logFunction(`Created channel! '${channel.name}' (pw: ${channel.password})...`);

				result.error = 0;
				result.message = "Created channel!";
				result.channel = channel;
			} else {
				logFunction(`Channel naming error! '${name}' (pw: ${password})...`);
				result.error = 1;
				result.message = "Channel name must only contain letters or numbers!";
			}
		} else {
			logFunction(`Channel duplication! '${name}' (pw: ${password})...`);
			result.error = 1;
			result.message = "Channel already exists!";
		}

		return result;
	};
	this.queueRemoveChannel = function (name, waitTime = 1000) {
		try {
			setTimeout(() => {
				var room = io.sockets.adapter.rooms[name];

				// If room is empty it doesn't exist
				if (typeof room == 'undefined') {
					logFunction(`Removing empty channel '${name}'...`);

					var index = openChannels.findIndex((channel) => {
						return channel.name == name;
					});

					if (index >= 0) {
						openChannels.splice(index, 1);
					} else {
						logFunction('Channel already deleted!');
					}
				}
			}, waitTime);
		} catch (e) {
			console.log("Delete exception!");
			console.log(e);
		}
	};



	// VALIDATIONS
	this.validateChannel = function (name, password) {
		var num;
		var validation = {
			valid: true,
			message: "none"
		};

		num = openChannels.findIndex((item) => {
			return (item.name == name) && (item.password == password);
		});
		if (num < 0) {
			validation.valid = false;
			num = openChannels.findIndex((item) => {
				return item.name == name;
			});

			if (num < 0) {
				validation.message = "Channel does not exist!";
			} else {
				validation.message = "Wrong password";
			}
		}

		return validation;
	}
	this.validateChannelName = function (channelName) {
		return !/[^a-z0-9]+/gi.test(channelName);
	}

	return this;
}