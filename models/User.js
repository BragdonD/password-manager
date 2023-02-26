const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const fieldEncryption = require('mongoose-field-encryption');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
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
    required: true
  }
});

userSchema.plugin(uniqueValidator,  { type: 'ValidationError' });

// Encrypt the email and name fields using mongoose-field-encryption before storing them in the database
userSchema.plugin(fieldEncryption.fieldEncryption, {
  fields: ['name'],
  secret: process.env.ENCRYPTION_KEY_32BYTE,
  saltGenerator: (secret) => crypto.randomBytes(16),
});

// Hash the password field before saving the user to the database
userSchema.pre('save', function(next) {
  const user = this;
  if (!user.isModified('password')) return next();
  bcrypt.hash(user.password, 10, function(err, hash) {
    if (err) return next(err);
    user.password = hash;
    next();
  });
});

const User = mongoose.model('User', userSchema);

module.exports = User;