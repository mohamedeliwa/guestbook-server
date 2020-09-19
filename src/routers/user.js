const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");

const router = new express.Router();

// End-Point for Creating a new user
router.post("/users", async (req, res) => {
  try {
    // const user = new User(req.body);
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: req.body.password,
      email: req.body.email,
    });
    await user.save();
    const token = await user.generateAuthToken();
    const cookieAge = 24 * 60 * 60 * 1000;
    res.cookie("jwt", await token, {
      maxAge: cookieAge,
      httpOnly: true /*secure: true ,*/,
    });
    res.status(201).send(user);
  } catch (error) {
    console.log({ error: error.message });
    res.status(400).send({ error: error.message });
  }
});

// End-Point for logining in
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    // if (remember me) 7 days
    // else 1 day
    const cookieAge = req.body.rememberMe
      ? 7 * 24 * 60 * 60 * 1000
      : 24 * 60 * 60 * 1000;
    res.cookie("jwt", await token, {
      maxAge: cookieAge,
      httpOnly: true /*, secure: true */,
    });
    res.send(user);
  } catch (error) {
    console.log({ error: error.message });
    res.status(400).send({ error: error.message });
  }
});

// End-Point for fetching Profile data,
router.get("/users/profile", auth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (error) {
    console.log({ error: error.message });
    res.status(400).send({ error: error.message });
  }
});

// End-Point for loging out
router.post("/users/logout", auth, async (req, res) => {
  try {
    res.clearCookie("jwt", { httpOnly: true /*secure: true */ });
    res.send();
  } catch (error) {
    console.log({ error: error.message });
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
