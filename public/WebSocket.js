webSocket = {
    socket: null,
    webSocketLocation: window.location.host,
    webSocketPath: "WebSockets",
    webSocketName: "MainWebSocket",
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
        return "ws://" + webSocket.webSocketLocation + "/" + webSocket.webSocketPath + "/" + webSocket.webSocketName;
    }
};

export { webSocket };