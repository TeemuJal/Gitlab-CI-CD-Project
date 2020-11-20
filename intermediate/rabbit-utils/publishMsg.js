#!/usr/bin/env node
// Publish a new message to the queue

"use strict";

var amqp = require("amqplib");

module.exports.publishMsg = function(rabbitHost, exchangeName, topic, msg) {
  amqp.connect("amqp://" + rabbitHost).then(function(connection) {
    connection.createConfirmChannel().then(function(channel) {
      channel.assertExchange(exchangeName, "topic", {
        durable: false
      });

      channel.publish(
        exchangeName, topic, Buffer.from(msg), {},
        function(err, ok) {
          if (err !== null) console.warn(new Date(), `Message: "${msg}" nacked!`);
          else {
            console.log(new Date(), `Message: "${msg}" acked!`);
          }
        }
      );
    });
  });
};
