"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = __importStar(require("express"));
var http = __importStar(require("http"));
var WebSocket = __importStar(require("ws"));
var app = express.default();
var server = http.createServer(app);
var wss = new WebSocket.Server({ server: server });
var webPort = 8080;
var socketPort = 8081;
// WebSocket listener
wss.on('connection', function (ws) {
    // Send Callback
    ws.send("Callback.. Hellooo!");
    // Add a simple message event
    ws.on('message', function (message) {
        // Log the received message and send it back to the client
        console.log('received: %s', message);
        // Broadcast message to everyone 
        wss.clients.forEach(function (client) {
            client.send("Hello, broadcast message -> " + message);
        });
    });
});
//Static server
app.use(express.static("public"));
app.get('/', function (req, res) {
    res.sendFile(__dirname + "/static/main.html");
});
app.listen(webPort, function () {
    console.log("App listening on port " + webPort + "!");
});
server.listen(socketPort, function () {
    console.log("Web Socket server started on port " + socketPort + " :)");
});
