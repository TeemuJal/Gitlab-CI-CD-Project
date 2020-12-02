/**
 * @jest-environment node
 */

const app = require("../../api-gateway/app.js");
const supertest = require("supertest");
const fs = require("fs");
let server;

beforeEach(() => {
  server = supertest(app);
});

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
    jest.setTimeout(8000);

    // Set ORIG service to not send anymore messages
    const res = await server.put("/state/PAUSED");
    expect(res.status).toBe(200);
    
    // Wait for currently queued messages to be registered
    await sleep(1000);

    // Fetch messages from the file
    let original_messages;
    fs.readFileSync("/var/lib/messages/messages.txt", function(err, data) {
      original_messages = data;
    });

    // Wait to see if new messages are registered
    await sleep(4000);

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
