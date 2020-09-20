const express = require("express");
const User = require("../models/user");
const Message = require("../models/message");
const Reply = require("../models/reply");
// Requiring auth middleware
const auth = require("../middleware/auth");

const router = new express.Router();

// End-Point for Creating a new message
router.post("/messages", auth, async (req, res) => {
  try {
    // Creating an instance of message model
    const owner = req.user;
    const message = new Message({
      content: req.body.content,
      owner: owner._id,
    });
    // saving the new message
    await message.save();
    res.status(201).send(message);
  } catch (error) {
    console.log({ error: error.message });
    res.status(400).send({ error: error.message });
  }
});

// End-Point for fetching multiple messages
// with query strings user can filter requested data
// GET /messages?user_id={_id}
// with query strings we can implement pagination.
// GET /messages?limit=10&skip=0 "1st page of 10"
// GET /messages?limit=3&skip=0 "1st page of 3"
// GET /messages?limit=3&skip=3 "2nd page of 3"
// GET /messages?limit=3&skip=6 "3rd page of 3"
// with query strings we can implement sorting data.
// we can sort by any property for example createdAt
// GET /messages?sortBy=createdAt:desc
// GET /messages?sortBy=createdAt:asc
router.get("/messages", auth, async (req, res) => {
  try {
    // getting query string values from the url
    const match = {};
    // getting sort value from query string
    const sort = {};
    // checking if the user_id query string is provided on the url
    if (req.query.user_id) {
      // checking if the user exists in DB
      const user = await User.findById(req.query.user_id);
      if (!user) throw new Error("user not found!");
      match.owner = req.query.user_id;
    }
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(":");
      // parts[1] should be "asc" or "desc"
      sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }
    const messages = await Message.find(match, null, {
      // limiting population to get only specific number of messages
      limit: parseInt(req.query.limit),
      // skiping specific number of messages
      skip: parseInt(req.query.skip),
      // to sort data according to specific sorting criteria
      sort,
    }).populate({
      path: "owner",
    });
    res.send(messages);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).send({ error: error.message });
  }
});

// End-Point for one message, by ID
router.get("/messages/:id", auth, async (req, res) => {
  try {
    const user = req.user;
    const message = await Message.findById(req.params.id).populate({
      path: "owner",
    }).populate({
      path: "replies",
      populate: {path: "owner"}
    });

    if (!message) throw new Error("Message not found!");
    // checking if the user is the owner of the message
    // if (user._id.toString() !== message.owner._id.toString())
    //   throw new Error("You're not the owner of the message!");
    res.send(message);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).send({ error: error.message });
  }
});



// End-Point for updating a message content
router.patch("/messages/:id", auth, async (req, res) => {
  try {
    const allowedUpdates = [
      "content",
    ];
    const updates = req.body;
    const updatesKeys = Object.keys(updates);
    const isValidOperation = updatesKeys.every((item) =>
      allowedUpdates.includes(item)
    );
    if (!isValidOperation) throw new Error("Invalid Updates!");
    const message = await Message.findById(req.params.id);
    if (!message) throw new Error("Message not found!");
    updatesKeys.forEach((key) => {
      message[key] = updates[key];
    });
    await message.save();
    res.send(message);
  } catch (error) {
    console.log({ error: error.message });
    res.status(400).send({ error: error.message });
  }
});

// End-Point for deleting a message
router.delete("/messages/:id", auth, async (req, res) => {
  try {
    const owner = req.user;
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).send({ error: "Message not found!" });
    const replies = await Reply.deleteMany({message: req.params.id});
    res.send(message);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
