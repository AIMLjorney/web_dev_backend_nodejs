const mongoose = require('mongoose');

const encryptionRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  algorithm: {
    type: String,
    required: true,
    enum: {
      values: ['AES', 'DES', '3DES', 'Blowfish', 'Twofish', 'RSA'],
      message: '{VALUE} is not supported'
    }
  },
  operation: {
    type: String,
    required: true,
    enum: ['encrypt', 'decrypt']
  },
  originalData: {
    type: String,
    required: true
  },
  encryptedData: {
    type: String
  },
  key: {
    type: String,
    required: true
  },
  fileInfo: {
    originalName: String,
    encryptedName: String,
    mimeType: String,
    size: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
encryptionRecordSchema.index({ user: 1, timestamp: -1 });
encryptionRecordSchema.index({ algorithm: 1 });

module.exports = mongoose.model('EncryptionRecord', encryptionRecordSchema);