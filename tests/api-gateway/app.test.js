/**
 * @jest-environment node
 */

const app = require("../../api-gateway/app.js");
const supertest = require("supertest");
const fs = require("fs");
const server = supertest(app);

const system_containers = ["orig-test", "imed-test", "obse-test", "httpserv-test", "rabbitmq-test"];

describe("GET /messages", () => { 
  test("Test that endpoint returns all messages registered with OBSE-service", async done => {
    const res = await server.get("/messages");
  
    expect(res.status).toBe(200);
    expect(res.text.replace(/"([^"]+(?="))"/g, '$1')).toMatch(new RegExp(/^((?:\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z) Topic my\.(o|i):( Got)? MSG_\d+\n?)+)$/));
    done();
  });
});

describe("PUT /state", () => { 
  test("Test setting system's state to PAUSED", async done => {
    jest.setTimeout(8000);

    // Set system's state to PAUSED
    const res = await server.put("/state/PAUSED");
    expect(res.status).toBe(200);
    
    // Wait for currently queued messages to be registered
    await sleep(1000);

    // Fetch messages from the file
    const original_messages = fs.readFileSync("/var/lib/messages/messages.txt", "utf8");

    // Wait to see if new messages are registered
    await sleep(4000);

    // Fetch messages from the file
    const new_messages = fs.readFileSync("/var/lib/messages/messages.txt", "utf8");

    // Check responses are the same i.e. setting system to PAUSED state was successful
    expect(new_messages).toBe(original_messages);
    done();
  });

  test("Test setting system's state to RUNNING", async done => {
    jest.setTimeout(8000);

    // Set system's state to PAUSED
    const res_state_paused = await server.put("/state/PAUSED");
    expect(res_state_paused.status).toBe(200);
    
    // Wait for currently queued messages to be registered
    await sleep(1000);

    // Fetch messages from the file
    const original_messages = fs.readFileSync("/var/lib/messages/messages.txt", "utf8");

    // Set system's state to RUNNING
    const res_state_running = await server.put("/state/RUNNING");
    expect(res_state_running.status).toBe(200);

    // Wait to see if new messages are registered
    await sleep(5000);

    // Fetch messages from the file
    const new_messages = fs.readFileSync("/var/lib/messages/messages.txt", "utf8");

    // Check responses are not the same i.e. setting system to RUNNING state was successful
    expect(new_messages).not.toBe(original_messages);
    done();
  });

  test("Test setting system's state to the same state", async done => {
    // Set system to RUNNING again since default state is RUNNING
    const res = await server.put("/state/RUNNING");
    expect(res.status).toBe(200);
    const res2 = await server.put("/state/RUNNING");
    expect(res2.text).toBe("State is already RUNNING.");
    done();
  });

  test("Test setting system's state to an invalid state", async done => {
    // Set system to an invalid state
    const res = await server.put("/state/INVALIDSTATE");
    expect(res.status).toBe(400);
    done();
  });

  test("Test setting system's state to INIT while system is up", async done => {
    jest.setTimeout(7000);
    
    // Set system's state to PAUSED
    const res_paused = await server.put("/state/PAUSED");
    expect(res_paused.status).toBe(200);

    // Fetch current messages from the file
    const messages_before_init = fs.readFileSync("/var/lib/messages/messages.txt", "utf8");

    // Set system's state to INIT
    const res_state_paused = await server.put("/state/INIT");
    expect(res_state_paused.status).toBe(200);

    // Wait to see if system was put into RUNNING state again
    await sleep(5000);

    // Fetch messages from the file after system is RUNNING again
    const messages_after_init = fs.readFileSync("/var/lib/messages/messages.txt", "utf8");

    // Check length of messages before INIT is longer than after i.e. setting system to INIT state was successful
    expect(messages_before_init.length).toBeGreaterThan(messages_after_init.length);
    // Check that first line ends with '1' i.e. message counter was reset and we got message "Got_1"
    expect(messages_after_init.charAt(41)).toBe("1");
    done();
  });

  test("Test setting system's state to SHUTDOWN", async done => {
    jest.setTimeout(30000);
    
    // Set system's state to SHUTDOWN
    const res = await server.put("/state/SHUTDOWN");
    expect(res.status).toBe(200);

    const stopped_containers = res.body.stopped_containers;

    // Confirm that all containers were stopped
    expect(stopped_containers).toEqual(system_containers);
    done();
  });

  test("Test setting system's state to INIT while system is down", async done => {
    jest.setTimeout(45000);
    
    // Set system's state to INIT to start all containers
    const res = await server.put("/state/INIT");
    expect(res.status).toBe(200);

    const started_containers = res.body.started_containers;

    // Confirm that all containers were started
    expect(started_containers).toEqual(system_containers);

    // Wait for services to start
    await sleep(20000);

    done();
  });
});

describe("GET /state", () => { 
  test("Test that endpoint returns the current state of the system", async done => {
    const res = await server.get("/state");
    expect(res.status).toBe(200);
    // System should be in RUNNING state
    expect(res.text).toBe("RUNNING");
    done();
  });
});

describe("GET /run-logs", () => { 
  test("Test that state changes are saved and returned correctly from the endpoint", async done => {
    jest.setTimeout(10000);

    try {
      // Empty the run-log file
      fs.writeFileSync("/var/lib/messages/run-log.txt", "");
    } catch (error) {
      console.error(error);
    } 

    // Pause system (state -> PAUSED)
    const res_paused = await server.put("/state/PAUSED");
    expect(res_paused.status).toBe(200);

    // Initialize system (state -> INIT -> then RUNNING)
    const res_init = await server.put("/state/INIT");
    expect(res_init.status).toBe(200);

    // Get logs
    const res_logs = await server.get("/run-log");
    expect(res_logs.status).toBe(200);

    // Parse output to an array
    const log_messages = res_logs.body.toString("utf-8").split("\n").slice(0, -1);
    
    // Check state changes were logged and logs are in expected format <ISO-date>: <STATE>
    expect(log_messages[0].replace(/"([^"]+(?="))"/g, '$1')).toMatch(new RegExp(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z): PAUSED$/));
    expect(log_messages[1].replace(/"([^"]+(?="))"/g, '$1')).toMatch(new RegExp(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z): INIT$/));
    expect(log_messages[2].replace(/"([^"]+(?="))"/g, '$1')).toMatch(new RegExp(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z): RUNNING$/));
    done();
  });
});

function sleep(ms) {
  return new Promise((resolve) => {
      setTimeout(resolve, ms);
  });
}  
