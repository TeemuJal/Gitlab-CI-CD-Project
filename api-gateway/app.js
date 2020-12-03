const express = require("express");
const app = express();
const axios = require("axios");
const fs = require("fs");

const states = {
  PAUSED: "PAUSED",
  RUNNING: "RUNNING",
  INIT: "INIT"
};

let current_state = states.RUNNING;

// Endpoint for getting all registered messages
app.get("/messages", async function (req, res) {
  try {
    const messages = await axios.get("http://httpserv:8082/");
    res.send(messages.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong.");
  } 
});

// Endpoint for changing the state of the system
app.put("/state/:new_state", async function (req, res) {
  const new_state = req.params.new_state;
  // Check if given state is a valid state
  if (Object.values(states).indexOf(new_state) > -1) {
    // Change to new state if it's not the current state
    if (new_state !== current_state) {
      switch(new_state) {
        // Pause ORIG
        case states.PAUSED: {
          try {
            const response = await axios.post("http://orig:5000/pause");
            current_state = states.PAUSED;
            res.send(response.data);
          } catch (error) {
            console.error(error);
            res.status(500).send("Something went wrong.");
          }
          break;
        }
        // Start ORIG
        case states.RUNNING: {
          try {
            const response = await axios.post("http://orig:5000/start");
            current_state = states.RUNNING;
            res.send(response.data);
          } catch (error) {
            console.error(error);
            res.status(500).send("Something went wrong.");
          } 
          break;
        }
        // Initialize system
        case states.INIT: {
          try {
            // Pause ORIG
            await axios.post("http://orig:5000/pause");
            // Reset message counter
            await axios.post("http://orig:5000/reset_message_counter");
            // Make sure queue is empty
            await sleep(1000);
            // Empty the message file
            await fs.writeFileSync("/var/lib/messages/messages.txt", "");
            // Start ORIG again
            await axios.post("http://orig:5000/start");
            current_state = states.RUNNING;
            res.send("System initialized");
          } catch (error) {
            console.error(error);
            res.status(500).send("Something went wrong.");
          } 
          break;
        }
      }
    } else {
      res.status(200).send(`State is already ${new_state}.`);
    }
  } else {
    res.status(400).send("Invalid state.");
  } 
});

function sleep(ms) {
  return new Promise((resolve) => {
      setTimeout(resolve, ms);
  });
}  

module.exports = app;
