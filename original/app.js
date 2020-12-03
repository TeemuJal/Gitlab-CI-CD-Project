const express = require("express");
const app = express();

const mqPublish = require('./rabbit-utils/publishMsg.js');
const topic = "my.o";

let interval_id = setInterval(publishMessageToQueue, 3000);
let msg_counter = 0;

// Endpoint for starting the ORIG service to send messages
app.post("/start", function (req, res){
    interval_id = setInterval(publishMessageToQueue, 3000);
    res.status(200).send("ORIG running");
});

// Endpoint for pausing the ORIG service to stop sending messages
app.post("/pause", function (req, res){
    clearInterval(interval_id);
    res.status(200).send("ORIG paused");
});

app.post("/reset_message_counter", function (req, res) {
    msg_counter = 0;
    res.status(200).send("Message counter reset");
});

// Publish a message to the queue
function publishMessageToQueue() {
    msg_counter += 1;
    const msg = `MSG_${msg_counter}`;
    mqPublish.publishMsg("guest:guest@rabbitmq", "messages", topic, msg);
}

module.exports = app;
