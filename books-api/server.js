const express = require("express");
const cors = require("cors");
const { setup: bookControllerSetup } = require("./book.controller");
const { register, login } = require("./auth.controller");

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "127.0.0.1";
const app = express();

function setupApp() {
  app.use(cors());
  app.use(express.json());
}

function setupControllers(app) {
  // auth routes
  app.post("/auth/register", register);
  app.post("/auth/login", login);

  // book routes
  bookControllerSetup(app);
}

function main() {
  setupApp();
  setupControllers(app);
  app.listen(PORT, () =>
    console.log(`Server is running at http://${HOST}:${PORT}`)
  );
}

main();
