const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const fieldEncryption = require('mongoose-field-encryption');
const crypto = require('crypto');
if (process.env.NODE_ENV!== 'production') {
  require('dotenv').config({ path: `.env.dev`, override: true });
}

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

// Hash the password field 
passwordSchema.plugin(fieldEncryption.fieldEncryption, {
  fields: ["password"],
  secret: process.env.ENCRYPTION_KEY_32BYTE,
  saltGenerator: secret => crypto.randomBytes(16),
});

const Password = mongoose.model('Password', passwordSchema);
module.exports = Password;