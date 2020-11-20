const mqReceive = require('./rabbit-utils/receiveMsg.js');
const receiveTopic = "my.o";

const mqPublish = require('./rabbit-utils/publishMsg.js');
const publishTopic = "my.i";

mqReceive.receiveMessages("guest:guest@rabbitmq", "messages", receiveTopic, msgReceived);

async function msgReceived(message) {
  await sleep(1000);
  const msg = `Got ${message}`;
  mqPublish.publishMsg("guest:guest@rabbitmq", "messages", publishTopic, msg);
};
  
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}  
