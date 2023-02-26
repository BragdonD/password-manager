const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const encryption = require('mongoose-encryption');
const User = require('./User');

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

// Add encryption plugin
passwordSchema.plugin(encryption, { 
    encryptionKey: process.env.ENCRYPTION_KEY_32BYTE, 
    signingKey: process.env.SIGNING_KEY_64BYTE,
    encryptedFields: ['appname', 'password', 'id'],
});

const Password = mongoose.model('Password', passwordSchema);

module.exports = Password;