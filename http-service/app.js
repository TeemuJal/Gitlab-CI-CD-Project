const http = require("http");
const fs = require("fs");

const server = http.createServer((req, res) => {
  fs.readFile("/var/lib/messages/messages.txt", function(err, data) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    if (err || data == "") {
      res.end("No messages yet.");
    }
    else {
      res.end(data);
    }
  });
});

module.exports = server;
