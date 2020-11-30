const rewire = require("rewire");
const app = rewire("../../http-service/app.js");
const supertest = require("supertest");

describe("e2e tests", () => {
  let server;
  beforeAll(async () => {
    server = supertest(app.__get__("server"));
    await sleep(4000);
  });

  test("Test http-service with and e2e test", async done => {
    const res = await server.get("/");

    expect(res.status).toBe(200);
    expect(res.text.replace(/"([^"]+(?="))"/g, '$1')).toMatch(new RegExp(/^((?:\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z) Topic my\.(o|i): ?(Got)? MSG_\d+\n?){6})$/));
    done();
  });
});

function sleep(ms) {
  return new Promise((resolve) => {
      setTimeout(resolve, ms);
  });
}  
