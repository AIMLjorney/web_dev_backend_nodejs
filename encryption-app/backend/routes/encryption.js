const express = require('express');
const crypto = require('crypto');
const CryptoJS = require('crypto-js');
const auth = require('../middleware/auth');
const EncryptionRecord = require('../models/EncryptionRecord');
const router = express.Router();

// Enhanced Encryption Service
class EncryptionService {
  // AES Encryption (256-bit)
  static aesEncrypt(text, key) {
    try {
      return CryptoJS.AES.encrypt(text, key).toString();
    } catch (error) {
      throw new Error('AES encryption failed: ' + error.message);
    }
  }

  static aesDecrypt(ciphertext, key) {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, key);
      const result = bytes.toString(CryptoJS.enc.Utf8);
      if (!result) throw new Error('Invalid key or corrupted data');
      return result;
    } catch (error) {
      throw new Error('AES decryption failed: ' + error.message);
    }
  }

  // DES Encryption
  static desEncrypt(text, key) {
    try {
      const keyHash = CryptoJS.MD5(key).toString().substring(0, 8);
      return CryptoJS.DES.encrypt(text, keyHash).toString();
    } catch (error) {
      throw new Error('DES encryption failed: ' + error.message);
    }
  }

  static desDecrypt(ciphertext, key) {
    try {
      const keyHash = CryptoJS.MD5(key).toString().substring(0, 8);
      const bytes = CryptoJS.DES.decrypt(ciphertext, keyHash);
      const result = bytes.toString(CryptoJS.enc.Utf8);
      if (!result) throw new Error('Invalid key or corrupted data');
      return result;
    } catch (error) {
      throw new Error('DES decryption failed: ' + error.message);
    }
  }

  // 3DES Encryption
  static tripleDesEncrypt(text, key) {
    try {
      const keyHash = CryptoJS.MD5(key).toString().substring(0, 24);
      return CryptoJS.TripleDES.encrypt(text, keyHash).toString();
    } catch (error) {
      throw new Error('3DES encryption failed: ' + error.message);
    }
  }

  static tripleDesDecrypt(ciphertext, key) {
    try {
      const keyHash = CryptoJS.MD5(key).toString().substring(0, 24);
      const bytes = CryptoJS.TripleDES.decrypt(ciphertext, keyHash);
      const result = bytes.toString(CryptoJS.enc.Utf8);
      if (!result) throw new Error('Invalid key or corrupted data');
      return result;
    } catch (error) {
      throw new Error('3DES decryption failed: ' + error.message);
    }
  }

  // Blowfish Encryption
  static blowfishEncrypt(text, key) {
    try {
      return CryptoJS.Blowfish.encrypt(text, key).toString();
    } catch (error) {
      throw new Error('Blowfish encryption failed: ' + error.message);
    }
  }

  static blowfishDecrypt(ciphertext, key) {
    try {
      const bytes = CryptoJS.Blowfish.decrypt(ciphertext, key);
      const result = bytes.toString(CryptoJS.enc.Utf8);
      if (!result) throw new Error('Invalid key or corrupted data');
      return result;
    } catch (error) {
      throw new Error('Blowfish decryption failed: ' + error.message);
    }
  }

  // RSA Key Generation
  static generateRSAKeys() {
    try {
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
      });
      return { publicKey, privateKey };
    } catch (error) {
      throw new Error('RSA key generation failed: ' + error.message);
    }
  }

  // RSA Encryption
  static rsaEncrypt(text, publicKey) {
    try {
      const buffer = Buffer.from(text, 'utf8');
      const encrypted = crypto.publicEncrypt(publicKey, buffer);
      return encrypted.toString('base64');
    } catch (error) {
      throw new Error('RSA encryption failed: ' + error.message);
    }
  }

  static rsaDecrypt(ciphertext, privateKey) {
    try {
      const buffer = Buffer.from(ciphertext, 'base64');
      const decrypted = crypto.privateDecrypt(privateKey, buffer);
      return decrypted.toString('utf8');
    } catch (error) {
      throw new Error('RSA decryption failed: ' + error.message);
    }
  }

  // Generate secure random key
  static generateKey(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }
}

// Input validation middleware
const validateEncryptionInput = (req, res, next) => {
  const { algorithm, text, key } = req.body;
  const operation = req.path.includes('encrypt') ? 'encrypt' : 'decrypt';

  if (!algorithm) {
    return res.status(400).json({
      success: false,
      message: 'Algorithm is required'
    });
  }

  if (!text && !req.body.encryptedData) {
    return res.status(400).json({
      success: false,
      message: operation === 'encrypt' ? 'Text to encrypt is required' : 'Encrypted data is required'
    });
  }

  if (!key && algorithm !== 'RSA') {
    return res.status(400).json({
      success: false,
      message: 'Encryption key is required'
    });
  }

  if (key && key.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Key must be at least 8 characters long'
    });
  }

  next();
};

// Encrypt endpoint
router.post('/encrypt', auth, validateEncryptionInput, async (req, res) => {
  try {
    const { algorithm, text, key } = req.body;
    const algorithmUpper = algorithm.toUpperCase();

    let encryptedData;
    let additionalData = {};

    switch (algorithmUpper) {
      case 'AES':
        encryptedData = EncryptionService.aesEncrypt(text, key);
        break;
      case 'DES':
        encryptedData = EncryptionService.desEncrypt(text, key);
        break;
      case '3DES':
        encryptedData = EncryptionService.tripleDesEncrypt(text, key);
        break;
      case 'BLOWFISH':
        encryptedData = EncryptionService.blowfishEncrypt(text, key);
        break;
      case 'RSA':
        const keys = EncryptionService.generateRSAKeys();
        encryptedData = EncryptionService.rsaEncrypt(text, keys.publicKey);
        additionalData = {
          publicKey: keys.publicKey,
          privateKey: keys.privateKey,
          keyWarning: 'Save these keys securely! You will need the private key for decryption.'
        };
        break;
      default:
        return res.status(400).json({
          success: false,
          message: `Unsupported algorithm: ${algorithm}. Supported: AES, DES, 3DES, Blowfish, RSA`
        });
    }

    // Save to database
    const record = new EncryptionRecord({
      user: req.user._id,
      algorithm: algorithmUpper,
      operation: 'encrypt',
      originalData: text.substring(0, 500), // Store first 500 chars only
      encryptedData: encryptedData.substring(0, 1000), // Store first 1000 chars
      key: algorithmUpper === 'RSA' ? 'RSA Keys Generated' : key
    });
    await record.save();

    res.json({
      success: true,
      algorithm: algorithmUpper,
      originalText: text,
      encryptedData,
      keyUsed: algorithmUpper === 'RSA' ? 'RSA Key Pair Generated' : key,
      timestamp: new Date(),
      ...additionalData,
      message: `Encryption completed successfully using ${algorithmUpper}`
    });
  } catch (error) {
    console.error('Encryption error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Encryption failed'
    });
  }
});

// Decrypt endpoint
router.post('/decrypt', auth, validateEncryptionInput, async (req, res) => {
  try {
    const { algorithm, encryptedData, key, privateKey } = req.body;
    const algorithmUpper = algorithm.toUpperCase();

    let decryptedData;

    switch (algorithmUpper) {
      case 'AES':
        decryptedData = EncryptionService.aesDecrypt(encryptedData, key);
        break;
      case 'DES':
        decryptedData = EncryptionService.desDecrypt(encryptedData, key);
        break;
      case '3DES':
        decryptedData = EncryptionService.tripleDesDecrypt(encryptedData, key);
        break;
      case 'BLOWFISH':
        decryptedData = EncryptionService.blowfishDecrypt(encryptedData, key);
        break;
      case 'RSA':
        if (!privateKey) {
          return res.status(400).json({
            success: false,
            message: 'Private key is required for RSA decryption'
          });
        }
        decryptedData = EncryptionService.rsaDecrypt(encryptedData, privateKey);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: `Unsupported algorithm: ${algorithm}`
        });
    }

    // Save to database
    const record = new EncryptionRecord({
      user: req.user._id,
      algorithm: algorithmUpper,
      operation: 'decrypt',
      originalData: encryptedData.substring(0, 500),
      encryptedData: decryptedData.substring(0, 1000),
      key: algorithmUpper === 'RSA' ? 'RSA Private Key Used' : key
    });
    await record.save();

    res.json({
      success: true,
      algorithm: algorithmUpper,
      encryptedText: encryptedData,
      decryptedData,
      timestamp: new Date(),
      message: `Decryption completed successfully using ${algorithmUpper}`
    });
  } catch (error) {
    console.error('Decryption error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Decryption failed'
    });
  }
});

// Generate key endpoint
router.post('/generate-key', auth, (req, res) => {
  try {
    const { algorithm, length = 32 } = req.body;
    let keyLength = length;

    // Set appropriate key length for each algorithm
    switch (algorithm?.toUpperCase()) {
      case 'AES':
        keyLength = 32; // 256-bit
        break;
      case 'DES':
        keyLength = 8; // 64-bit
        break;
      case '3DES':
        keyLength = 24; // 192-bit
        break;
      case 'BLOWFISH':
        keyLength = 16; // 128-bit
        break;
    }

    const key = EncryptionService.generateKey(keyLength);
    
    res.json({
      success: true,
      algorithm: algorithm?.toUpperCase() || 'GENERAL',
      key,
      keyLength: key.length,
      message: `Secure ${keyLength * 8}-bit key generated successfully`
    });
  } catch (error) {
    console.error('Key generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Key generation failed'
    });
  }
});

// Get user's encryption history with pagination
router.get('/history', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const records = await EncryptionRecord.find({ user: req.user._id })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .select('-key -originalData -encryptedData'); // Exclude sensitive data

    const total = await EncryptionRecord.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      records,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch history'
    });
  }
});

// Get supported algorithms
router.get('/algorithms', auth, (req, res) => {
  const algorithms = [
    {
      name: 'AES',
      fullName: 'Advanced Encryption Standard',
      keySize: '128/192/256-bit',
      type: 'Symmetric',
      description: 'Most widely used encryption standard, secure and efficient'
    },
    {
      name: 'DES',
      fullName: 'Data Encryption Standard',
      keySize: '56-bit',
      type: 'Symmetric',
      description: 'Older standard, less secure but included for educational purposes'
    },
    {
      name: '3DES',
      fullName: 'Triple DES',
      keySize: '168-bit',
      type: 'Symmetric',
      description: 'More secure version of DES, applies DES three times'
    },
    {
      name: 'Blowfish',
      fullName: 'Blowfish',
      keySize: '32-448-bit',
      type: 'Symmetric',
      description: 'Fast and secure block cipher'
    },
    {
      name: 'RSA',
      fullName: 'Rivest–Shamir–Adleman',
      keySize: '2048-bit+',
      type: 'Asymmetric',
      description: 'Public-key cryptography, uses key pairs'
    }
  ];

  res.json({
    success: true,
    algorithms
  });
});

module.exports = router;


