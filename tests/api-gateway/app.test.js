/**
 * @jest-environment node
 */

const app = require("../../api-gateway/app.js");
const supertest = require("supertest");
const server = supertest(app);
const fs = require("fs");

describe("GET /messages", () =>{ 
  test("Test that endpoint returns all messages registered with OBSE-service", async done => {
    const res = await server.get("/messages");
  
    expect(res.status).toBe(200);
    expect(res.text.replace(/"([^"]+(?="))"/g, '$1')).toMatch(new RegExp(/^((?:\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z) Topic my\.(o|i):( Got)? MSG_\d+\n?)+)$/));
    done();
  });
});

describe("PUT /state", () =>{ 
  test("Test setting ORIG service's state to PAUSED", async done => {
    // Set ORIG service to not send anymore messages
    const res = await server.put("/state/:new_state").send("PAUSED");
    expect(res.status).toBe(200);
    
    console.log("ORIG set to PAUSED - waiting 10s");
    // Wait for currently queued messages to be registered
    await sleep(10000);

    console.log("Reading messages from file 1st time...");
    // Fetch messages from the file
    let original_messages;
    fs.readFileSync("/var/lib/messages/messages.txt", function(err, data) {
      original_messages = data;
    });

    console.log("1st messages read - waiting 5s for new messages");
    // Wait to see if new messages are registered
    await sleep(5000);

    console.log("Reading messages from file 2nd time...");
    // Fetch messages from the file
    let new_messages;
    fs.readFileSync("/var/lib/messages/messages.txt", function(err, data) {
      new_messages = data;
    });

    // Check responses are the same i.e. setting ORIG to PAUSED state was successful
    expect(new_messages).toBe(original_messages);
    done();
  });
});

function sleep(ms) {
  return new Promise((resolve) => {
      setTimeout(resolve, ms);
  });
}  
