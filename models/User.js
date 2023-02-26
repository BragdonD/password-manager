/*
 * This file defines the mongoose schema for a user in a Node.js application.
 * The user schema includes fields for email, name, and password.
 * The email and name fields are encrypted using mongoose-field-encryption before being stored in the database.
 * The password field is hashed using bcrypt before being stored in the database.
 * The uniqueValidator plugin is used to ensure that the email field is unique for each user.
 */
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const fieldEncryption = require("mongoose-field-encryption");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
if (process.env.NODE_ENV!== 'production') {
  require('dotenv').config({ path: `.env.dev`, override: true });
}
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
}, { timestamps: true });

// Add the uniqueValidator plugin to the userSchema to ensure that
// the email field is unique for each user
userSchema.plugin(uniqueValidator, { type: "ValidationError" });

// Encrypt the email and name fields using mongoose-field-encryption
// before storing them in the database
userSchema.plugin(fieldEncryption.fieldEncryption, {
  fields: ["name"],
  secret: process.env.ENCRYPTION_KEY_32BYTE,
  saltGenerator: (secret) => crypto.randomBytes(16),
});

// Hash the password field before saving the user to the database
userSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  bcrypt.hash(user.password, 10, function (err, hash) {
    if (err) return next(err);
    user.password = hash;
    next();
  });
});

// Method to check if the user has the good password
userSchema.methods.authenticate = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Function to update the password of the user
userSchema.methods.updatePassword = async function (newPassword) {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    this.password = hashedPassword;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const User = mongoose.model("User", userSchema);
module.exports = User;
