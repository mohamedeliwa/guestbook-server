const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    // getting the token from the request header
    const token = req.cookies.jwt;
    // verifying the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // finding the user
    const user = await User.findOne({
      _id: decodedToken._id,
    });
    // checking if the user and the token already exist
    if (!user) {
      throw new Error("auth: User not found!");
    }
    // passing the token used to login
    req.token = token;
    // passing the user we found to the route handler
    req.user = user;
    next();
  } catch (error) {
    console.log({ error: error.message });
    res.status(401).send({
      error: "Please authenticate.!",
    });
  }
};

module.exports = auth;
