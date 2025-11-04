// server/models/Member.js

const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  cni: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  cne: {
    type: String,
    trim: true
  },
  schoolLevel: {
    type: String,
    trim: true
  },
  whatsapp: {
    type: String,
    trim: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Member', MemberSchema);