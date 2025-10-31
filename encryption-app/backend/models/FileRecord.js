const mongoose = require('mongoose');

const fileRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  encryptedName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  algorithm: {
    type: String,
    required: true,
    enum: ['AES', 'DES', '3DES', 'Blowfish']
  },
  key: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FileRecord', fileRecordSchema);