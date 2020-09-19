const mongoose = require("mongoose");

// Creating a mongoose Schema
const replySchema = new mongoose.Schema(
  {
    content: {
      // content of the message
      type: String,
      required: true,
      trim: true,
      // minlength: 4,
      maxlength: 200,
    },
    message: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Message",
    },
    owner: {
      // owner of the message
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// messageSchema.methods.toJSON = function () {
//   const message = this;
//   const messageObject = message.toObject();
//   // removing sensitive informations

//   return messageObject;
// };

/**
 * Creating a Message model.
 */
const Reply = mongoose.model("Reply", replySchema);

module.exports = Reply;
