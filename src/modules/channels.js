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
				var valid = true;
				var password = req.query.pwd;
				var data = {
					event: "handshake",
					data: "Hello! C:"
				};

				logFunction(`${ws._socket.remoteAddress}:${ws._socket.remotePort} connecting -> ${channel.name} (pw: ${password})`);

				// Check if password is valid
				if (validateChannel(channel.name, password)) {
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
					data.data = "Wrong password!"
					valid = false;
				}
				// Send Handshake
				ws.send(JSON.stringify(data));

				if (!valid) {
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
	this.queueRemoveChannel = function (name) {
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
					} else {
						logFunction(`Channel does not exist!`)
					}
				}
			}, 2000);
		} catch (e) { }
	};
	this.validateChannel = function (name, password) {
		var number = openChannels.findIndex((item) => {

			return (item.name == name) && (item.password == password);
		});

		return number >= 0;
	}

	return this;
}