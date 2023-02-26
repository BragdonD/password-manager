const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require("bcrypt");

const passwordSchema = new mongoose.Schema({
  appname: {
    type: String,
    required: true,
    unique: true,
    minlength: 8,
    maxlength: 50
  },
  id: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 50
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Define a unique index on the appname field for each user
passwordSchema.index({ appname: 1, user: 1 }, { unique: true });

// Add unique validation plugin
passwordSchema.plugin(uniqueValidator);

// Hash the password field before saving the user to the database
passwordSchema.pre("save", function (next) {
  const password = this;
  if (!password.isModified("password")) return next();
  bcrypt.hash(password.password, 10, function (err, hash) {
    if (err) return next(err);
    password.password = hash;
    next();
  });
});

const Password = mongoose.model('Password', passwordSchema);
module.exports = Password;