const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("./db/mongoose");
const userRouter = require("./routers/user");
const messageRouter = require("./routers/message");
const replyRouter = require("./routers/reply");

const app = express();

app.use(express.json());
app.use(cookieParser());

/**
 * Enabling CORS for local testing purposes.
 * to be disabled on production
 */
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};
app.use(cors(corsOptions));

app.use(userRouter);
app.use(messageRouter);
app.use(replyRouter)
module.exports = app;
