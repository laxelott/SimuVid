module.exports = function (app) {
	const expressWs = require('express-ws');
	const ws = expressWs(app);

	this.app = undefined;
	this.openChannels = [];

	this.logFunction = function (data) {
		console.log(data);
	};

	this.createChannel = function (name, password) {
		var result = {
			error: 0,
			message: "No message"
		};

		// If channel is not registered
		if (openChannels.filter((channel) => { return channel.name == name }).length == 0) {
			var channel = {
				name: name,
				password: (name + password).hashCode().toString(16),
				wss: ws.getWss("/" + name)
			};

			openChannels.push(channel);

			logFunction(`Creating channel '${channel.name}' (pw: ${channel.password})...`);

			// WebSocket Listener
			app.ws("/" + channel.name, (ws, req) => {
				var password = req.query.pwd;
				var data = {
					event: "handshake",
					data: "Hello! C:"
				};
				var validation = validateChannel(channel.name, password);

				console.log(ws.handshake);

				logFunction(`${req.connection.remoteAddress} connecting -> ${channel.name} (pw: ${password})`);

				// Check if channel is valid
				if (validation.valid) {
					logFunction("Valid credentials");

					// Broadcast message event
					ws.onmessage = (event) => {
						try {
							data = JSON.parse(event.data);

							// Log message
							logFunction(`Recieved: ${data}`);

							// Add timestamp
							data.timestamp = new Date().getTime() + 500;

							// Broadcast message to everyone 
							channel.wss.clients.forEach(client => {
								client.send(JSON.stringify(data));
							});
						} catch (e) {
							addToLogFile(`Channel '${channel.name}' tried to die! (${event.data})`);
						}
					};

					ws.onclose = (event) => {
						logFunction(`${ws._socket.remoteAddress}:${ws._socket.remotePort} disconnected from '${channel.name}'`);

						// If all clients left, close the channel
						queueRemoveChannel(channel.name);

					};
				} else {
					data.data = validation.message;
				}
				// Send Handshake
				ws.send(JSON.stringify(data));

				if (!validation.valid) {
					ws.close();
				}
			})

			result.error = 0;
			result.message = "Channel created!";
			result.channel = channel;
		} else {
			logFunction(`Channel duplication! '${name}' (pw: ${password})...`);
			result.error = 1;
			result.message = "Channel already exists!";
		}

		return result;
	};
	this.queueRemoveChannel = function (name, waitTime = 2000) {
		try {
			var channel = openChannels.filter((channel) => {
				return channel.name = name;
			})[0];

			setTimeout(() => {
				if (channel.wss.clients.size == 0) {
					logFunction(`Removing empty channel '${name}'...`);

					var index = openChannels.findIndex((item) => {
						return item.name == name;
					});

					if (index >= 0) {
						openChannels[index].wss.close();
						openChannels.splice(index, 1);
						logFunction(`Channel closed`)
					} else {
						logFunction(`Channel does not exist!`)
					}
				}
			}, waitTime);
		} catch (e) { }
	};
	this.validateChannel = function (name, password) {
		var num;
		var res = {
			valid: true,
			message: "none"
		};
		
		num = openChannels.findIndex((item) => {
			return (item.name == name) && (item.password == password);
		});
		if (num < 0) {
			res.valid = false;
			num = openChannels.findIndex((item) => {
				return item.name == name;
			});

			if (num < 0) {
				res.message = "Channel does not exist!";
			} else {
				res.message = "Wrong password";
			}
		} 

		return res;
	}

	return this;
}