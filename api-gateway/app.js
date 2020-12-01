const express = require("express");
const app = express();
const axios = require("axios");

app.get("/messages", async function (req, res) {
  try {
    const messages = await axios.get("http://httpserv:8082/");
    res.send(messages.data);
  } catch (error){
    console.error(error);
    res.status(500).send("Something went wrong.");
  } 
});

module.exports = app;
