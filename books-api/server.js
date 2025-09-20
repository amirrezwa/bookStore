const express = require("express");
const cors = require("cors");
const { setup: bookControllerSetup } = require("./book.controller");

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "127.0.0.1";
const app = express();

function steupApp() {
  app.use(cors());
  app.use(express.json());
}

function setupControllers(app) {
  bookControllerSetup(app);
}

function main() {
  steupApp();
  setupControllers(app);
  app.listen(PORT, () =>
    console.log(`Server is running at http://${HOST}:${PORT}`)
  );
}

main();
