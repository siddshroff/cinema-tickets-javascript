process.on("uncaughtException", (err, origin) => {
  console.log("App crashed", err, origin);
  throw err;
});

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const noCache = require("nocache");
const https = require("node:https");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(helmet());
app.use(
    helmet({
      xFrameOptions: { action: "deny" },
    }),
  );
  app.use(
    helmet({
      strictTransportSecurity: {
        includeSubDomains: false,
      },
    }),
  );