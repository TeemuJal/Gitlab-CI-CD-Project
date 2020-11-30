const app = require("../../http-service/app.js");
const supertest = require("supertest");
const server = supertest(app);

test("Test http-service returns messages in the correct format", async done => {
  const res = await server.get("/");

  expect(res.status).toBe(200);
  expect(res.text.replace(/"([^"]+(?="))"/g, '$1')).toMatch(new RegExp(/^((?:\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z) Topic my\.(o|i): ?(Got)? MSG_\d+\n?){6})$/));
  done();
});
