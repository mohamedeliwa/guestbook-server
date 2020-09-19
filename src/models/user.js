const mongoose = require("mongoose");
const validator = require("validator");
// bcryptjs is a npm package used to hash passowrds
const bcrypt = require("bcryptjs");
// jsonwebtoken is a npm packge that creates, verify and manage json web tokens
const jwt = require("jsonwebtoken");

// Creating a mongoose Schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      // first name of the user
      type: String,
      required: true,
      trim: true,
      minlength: 4,
      maxlength: 50,
    },
    lastName: {
      // last name of the user
      type: String,
      required: true,
      trim: true,
      minlength: 4,
      maxlength: 50,
    },
    email: {
      // account email of the user
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email");
        }
      },
    },
    password: {
      // account password of the user
      type: String,
      required: true,
      minlength: 8,
      trim: true,
      validate(value) {
        const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/g;
        if (value.toLowerCase().includes("password")) {
          throw new Error("Password can not contain the word 'password'!");
        }
        if (!regex.test(value)) {
          throw new Error(
            "Password should contain at least one upper case, one small case letter and a number!"
          );
        }
      },
    },
  },
  {
    timestamps: true,
    // toJSON: { virtuals: true },
  }
);

// Setting up a virtual property for user
// this property will contain all messages that user has created.
userSchema.virtual("messages", {
  ref: "Message",
  localField: "_id",
  foreignField: "owner",
});

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  return token;
};

userSchema.methods.toJSON = function () {
  const user = this;
  // creating a copy of user object.
  const userObject = user.toObject();
  // removing sensitive informations
  delete userObject.password;

  return userObject;
};

// Defining a new static method, to find a user by its credentials
userSchema.statics.findByCredentials = async (email, password) => {
  // finding the user using email
  const user = await User.findOne({ email });
  // verifying that the user does exist
  if (!user) {
    throw new Error("There is no such email in the db!");
  }
  // compairing the stored password with the provided password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Wrong Password!");
  }

  return user;
};


userSchema.pre("save", async function (next) {
  const user = this;

  // checking if the password is already hashed or changed by the user and not hashed yet.
  if (user.isModified("password")) {
    // hashing the plaing text password
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

// this middleware deletes user mesaages when user is deleted
userSchema.pre("remove", async function (next) {
  // the value if "this" here is equal to the document being saved
  const user = this;
  // deletes every single task where the owner value equals the user _id.
  await Message.deleteMany({ owner: user._id });
  next();
});

/**
 * Creating a User model.
 * Each user inserted in the db should follow that model specifications defined in userSchema
 */
const User = mongoose.model("User", userSchema);

module.exports = User;
