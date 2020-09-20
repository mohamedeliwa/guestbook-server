const mongoose = require("mongoose");

// Creating a mongoose Schema
const replySchema = new mongoose.Schema(
  {
    content: {

      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Message",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);


const Reply = mongoose.model("Reply", replySchema);

module.exports = Reply;
