const express = require("express");
const cors = require("cors");
require("dotenv").config();
const cron = require("./config/cron");

const chatRoute = require("./routes/chat");
const routes = require("./routes");

const app = express();

cron.start;

app.use(cors());
app.use(express.json());

app.use("/api/chat", chatRoute);
app.use("/api", routes);

module.exports = app;
