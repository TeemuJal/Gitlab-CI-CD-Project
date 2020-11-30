const server = require("./app")
const port = 8082;

server.listen(port, () => {
  console.log(`Http-service listening on port ${port}/`);
});
