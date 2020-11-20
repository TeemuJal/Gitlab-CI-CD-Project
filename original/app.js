var mqPublish = require('./rabbit-utils/publishMsg.js');
const topic = "my.o";

publishThreeMessagesToQueue();

async function publishThreeMessagesToQueue() {
    await sleep(3000);
    const msg1 = "MSG_1";
    mqPublish.publishMsg("guest:guest@rabbitmq", "messages", topic, msg1);

    await sleep(3000);
    const msg2 = "MSG_2";
    mqPublish.publishMsg("guest:guest@rabbitmq", "messages", topic, msg2);

    await sleep(3000);
    const msg3 = "MSG_3";
    mqPublish.publishMsg("guest:guest@rabbitmq", "messages", topic, msg3);
}
  
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}  
