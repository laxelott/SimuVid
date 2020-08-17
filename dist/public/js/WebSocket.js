var webSocket = {
    socket: null,
    webSocketHost: window.location.host,
    webSocketLocation: "",
    webSocketProtocol: "ws",
    connect: function() {
        webSocket.socket = new WebSocket(webSocket.getFullPath());
        webSocket.socket.onopen = webSocket.onOpen;
        webSocket.socket.onerror = webSocket.onError;
        webSocket.socket.onclose = webSocket.onClose;
        webSocket.socket.onmessage = webSocket.onMessage;
    },
    onOpen: function() {
        console.log("Connected");
    },
    onMessage: function(msg) {
        console.log("Message Received:");
        console.log(msg);
    },
    onError: function(error) {  
        console.log("Error!");
        console.log(error);
    },
    onClose: function() {
        
    },
    send: function(content) {
        webSocket.socket.send(content);
    },
    getFullPath: function() {
        return `${this.webSocketProtocol}://${this.webSocketHost}/${this.webSocketLocation}`;
    }
};

export { webSocket };