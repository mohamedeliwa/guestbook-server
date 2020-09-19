const express = require("express");
require("./db/mongoose");
const userRouter = require("./routers/user");
const messageRouter = require("./routers/message");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(userRouter);
app.use(messageRouter);


module.exports = app;

