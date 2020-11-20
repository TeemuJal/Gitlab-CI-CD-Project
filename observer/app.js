const { create } = require("domain");
const fs = require("fs");
const mqReceive = require('./rabbit-utils/receiveMsg.js');
const receiveTopic = "#";

createEmptyFile();

mqReceive.receiveMessages("guest:guest@rabbitmq", "messages", receiveTopic, msgReceived);

async function msgReceived(message) {
  const resultString = `${new Date().toISOString()} Topic ${message.fields.routingKey}: ${message.content.toString()}\n`;
  console.log(resultString);
  
  try {
    await fs.appendFile("/var/lib/messages/messages.txt", resultString, async (err) => {
      if (err) throw err;
      console.log("Message was appended to the file.");
    });
  } catch (err) {
    console.error(err);
  }
};

async function createEmptyFile() {
  try {
    await fs.writeFile("/var/lib/messages/messages.txt", "", async (err) => {
      if (err) throw err;
      console.log("Empty file was created.");
    });
  } catch (err) {
    console.error(err);
  }
};
