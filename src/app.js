const express = require("express");
const cors = require("cors");
require("dotenv").config();

const chatRoute = require("./routes/chat");
const routes = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/chat", chatRoute);
app.use("/api", routes);

module.exports = app;
