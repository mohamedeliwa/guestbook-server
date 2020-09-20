const express = require("express");
const User = require("../models/user");
const Message = require("../models/message");
const Reply = require("../models/reply");
// Requiring auth middleware
const auth = require("../middleware/auth");

const router = new express.Router();

// End-Point for Creating a new reply
router.post("/replies", auth, async (req, res) => {
  try {
    // Creating an instance of reply model
    const owner = req.user;
    const reply = new Reply({
      content: req.body.content,
      message: req.body.messageID,
      owner: owner._id,
    });
    // saving the new reply
    await reply.save();
    res.status(201).send(reply);
  } catch (error) {
    console.log({ error: error.message });
    res.status(400).send({ error: error.message });
  }
});

// End-Point for fetching multiple replies
// with query strings user can filter requested data
// GET /replies?user_id={_id}
// with query strings we can implement pagination.
// GET /replies?limit=10&skip=0 "1st page of 10"
// GET /replies?limit=3&skip=0 "1st page of 3"
// GET /replies?limit=3&skip=3 "2nd page of 3"
// GET /replies?limit=3&skip=6 "3rd page of 3"
// with query strings we can implement sorting data.
// we can sort by any property for example createdAt
// GET /replies?sortBy=createdAt:desc
// GET /replies?sortBy=createdAt:asc
router.get("/replies", auth, async (req, res) => {
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
    const replies = await Reply.find(match, null, {
      // limiting population to get only specific number of messages
      limit: parseInt(req.query.limit),
      // skiping specific number of messages
      skip: parseInt(req.query.skip),
      // to sort data according to specific sorting criteria
      sort,
    }).populate({
      path: "owner",
    });
    res.send(replies);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).send({ error: error.message });
  }
});

// End-Point for one reply, by ID
router.get("/replies/:id", auth, async (req, res) => {
  try {
    const user = req.user;
    const reply = await Reply.findById(req.params.id).populate({
      path: "owner",
    });

    if (!reply) throw new Error("Reply not found!");
    // checking if the user is the owner of the reply
    // if (user._id.toString() !== reply.owner._id.toString())
    //   throw new Error("You're not the owner of the reply!");
    res.send(reply);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).send({ error: error.message });
  }
});

// End-Point for updating a reply content
router.patch("/replies/:id", auth, async (req, res) => {
  try {
    const allowedUpdates = ["content"];
    const updates = req.body;
    const updatesKeys = Object.keys(updates);
    const isValidOperation = updatesKeys.every((item) =>
      allowedUpdates.includes(item)
    );
    if (!isValidOperation) throw new Error("Invalid Updates!");
    const reply = await Reply.findById(req.params.id);
    if (!reply) throw new Error("Reply not found!");
    updatesKeys.forEach((key) => {
      reply[key] = updates[key];
    });
    await reply.save();
    res.send(reply);
  } catch (error) {
    console.log({ error: error.message });
    res.status(400).send({ error: error.message });
  }
});

// End-Point for deleting a reply
router.delete("/replies/:id", auth, async (req, res) => {
  try {
    const owner = req.user;
    const reply = await Reply.findByIdAndDelete(req.params.id);
    if (!reply) return res.status(404).send({ error: "Reply not found!" });
    res.send(reply);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
