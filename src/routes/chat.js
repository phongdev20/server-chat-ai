const express = require("express");
const { chatController } = require("../controllers/chatController");
require("dotenv").config();

const router = express.Router();

router.post("/", chatController);

module.exports = router;
