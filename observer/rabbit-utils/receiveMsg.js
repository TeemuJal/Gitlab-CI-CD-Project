#!/usr/bin/env node
// Receive messages from the queue

"use strict";

var amqp = require("amqplib");

module.exports.receiveMessages = function(rabbitHost, exchangeName, topic, callback) {
  amqp.connect("amqp://" + rabbitHost).then(function(connection) {
    connection.createConfirmChannel().then(function(channel) {
      channel.assertExchange(exchangeName, "topic", {
        durable: false
      });
      
      channel.assertQueue("").then(function(err, q) {
        console.log(" [*] Waiting for messages. To exit press CTRL+C");

        channel.bindQueue(q, exchangeName, topic);

        channel.consume(q, function(msg) {
          console.log(` [x] Done: ${msg.fields.routingKey}: ${msg.content.toString()}`);
          callback(msg);
        });
      });
    });
  })
};
