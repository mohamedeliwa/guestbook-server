const mongoose = require("mongoose");

// Creating a mongoose Schema
const messageSchema = new mongoose.Schema(
  {
    content: {
      // content of the message
      type: String,
      required: true,
      trim: true,
      // minlength: 4,
        maxlength: 200,
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
    toJSON: { virtuals: true },
  }
);
messageSchema.virtual("replies", {
  ref: "Reply",
  localField: "_id",
  foreignField: "message",
});

// messageSchema.methods.toJSON = function () {
//   const message = this;
//   const messageObject = message.toObject();
//   // removing sensitive informations


//   return messageObject;
// };

/**
 * Creating a Message model.
 */
const Message = mongoose.model("Mesaage", messageSchema);

module.exports = Message;
