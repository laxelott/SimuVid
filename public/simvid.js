import { webSocket } from "./WebSocket.js";

webSocket.webSocketName = "simvid";
webSocket.webSocketPath = "webSockets";

// Websocket events
webSocket.onMessage = function (msg) {
    var messDiv = document.createElement("div");
    messDiv.innerHTML = msg.data;
    $(messDiv).addClass("section");

    $("#chatContent").append(messDiv);
    $("#chatContent").get()[0].scrollTop = $("#chatContent").get()[0].scrollHeight;
};

function sendMessage() {
    var data = {
        name: $("#name").val(),
        message: $("#txtMessage").val()
    };

    $("#txtMessage").val("");
    $("#txtMessage").resize();

    webSocket.send(JSON.stringify(data));
}

// Main function
$(document).ready(function () {

    $("#txtMessage").keypress(function (ev) {
        if (ev.which === 13) {
            ev.preventDefault();
            sendMessage();
        }
    });
    $("#btnSend").click(function () {
        sendMessage();
    });

    $("#btnClear").click(function () {
        clearMessages();
    });

    webSocket.connect();
});