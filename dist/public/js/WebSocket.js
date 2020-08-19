var webSocket = {
    socket: null,
    webSocketHost: window.location.host,
    webSocketLocation: "",
    webSocketProtocol: "ws",
    connect: function (query = {}) {
        this.socket = io(this.getFullPath(), { query: query });

        this.events.forEach(event => {
            this.socket.on(event.name, event.handler);
        });
    },
    events: [
        {
            name: 'connect',
            handler: function () {
                console.log("Web Socket Connected");
            }
        }, {
            name: 'disconnect',
            handler: function () {
                console.log("Web Socket Closed!");
            }
        }, {
            name: 'error',
            handler: function (error) {
                console.log("Web Socket error!");
                console.log(error);
            }
        }
    ],
    send: function (content) {
        webSocket.socket.send({ data: content });
    },
    getFullPath: function () {
        return `${this.webSocketProtocol}://${this.webSocketHost}/${this.webSocketLocation}`;
    }
};

export { webSocket };