// const express = require('express');
// const fs = require('fs').promises;
// const path = require('path');
// const auth = require('../middleware/auth');
// const upload = require('../middleware/upload');
// const FileRecord = require('../models/FileRecord');
// const EncryptionService = require('../routes/encryption').EncryptionService;
// const router = express.Router();

// // Upload and encrypt file
// router.post('/upload-encrypt', auth, upload.single('file'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: 'No file uploaded'
//       });
//     }

//     const { algorithm, key } = req.body;
    
//     if (!algorithm || !key) {
//       // Clean up uploaded file
//       await fs.unlink(req.file.path).catch(console.error);
//       return res.status(400).json({
//         success: false,
//         message: 'Algorithm and key are required'
//       });
//     }

//     // Read the uploaded file
//     const fileBuffer = await fs.readFile(req.file.path);
//     const fileContent = fileBuffer.toString('base64');

//     // Encrypt the file content
//     let encryptedContent;
//     switch (algorithm.toUpperCase()) {
//       case 'AES':
//         encryptedContent = EncryptionService.aesEncrypt(fileContent, key);
//         break;
//       case 'DES':
//         encryptedContent = EncryptionService.desEncrypt(fileContent, key);
//         break;
//       case '3DES':
//         encryptedContent = EncryptionService.tripleDesEncrypt(fileContent, key);
//         break;
//       case 'BLOWFISH':
//         encryptedContent = EncryptionService.blowfishEncrypt(fileContent, key);
//         break;
//       default:
//         await fs.unlink(req.file.path).catch(console.error);
//         return res.status(400).json({
//           success: false,
//           message: 'Unsupported algorithm for file encryption'
//         });
//     }

//     // Create encrypted file
//     const encryptedFileName = `encrypted-${Date.now()}-${req.file.filename}`;
//     const encryptedFilePath = path.join(path.dirname(req.file.path), encryptedFileName);
    
//     await fs.writeFile(encryptedFilePath, encryptedContent);

//     // Save file record to database
//     const fileRecord = new FileRecord({
//       user: req.user._id,
//       originalName: req.file.originalname,
//       encryptedName: encryptedFileName,
//       mimeType: req.file.mimetype,
//       size: req.file.size,
//       algorithm: algorithm.toUpperCase(),
//       key: key
//     });
//     await fileRecord.save();

//     // Remove original file
//     await fs.unlink(req.file.path).catch(console.error);

//     res.json({
//       success: true,
//       message: 'File encrypted successfully',
//       fileInfo: {
//         originalName: req.file.originalname,
//         encryptedName: encryptedFileName,
//         algorithm: algorithm.toUpperCase(),
//         size: req.file.size,
//         encryptedSize: Buffer.from(encryptedContent).length,
//         uploadDate: new Date()
//       },
//       downloadUrl: `/api/files/download/${fileRecord._id}`
//     });
//   } catch (error) {
//     console.error('File encryption error:', error);
    
//     // Clean up files on error
//     if (req.file) {
//       await fs.unlink(req.file.path).catch(console.error);
//     }

//     res.status(500).json({
//       success: false,
//       message: 'File encryption failed: ' + error.message
//     });
//   }
// });

// // Download and decrypt file
// router.get('/download/:fileId', auth, async (req, res) => {
//   try {
//     const { fileId } = req.params;
//     const { key } = req.query;

//     if (!key) {
//       return res.status(400).json({
//         success: false,
//         message: 'Decryption key is required'
//       });
//     }

//     // Find file record
//     const fileRecord = await FileRecord.findOne({ 
//       _id: fileId, 
//       user: req.user._id 
//     });

//     if (!fileRecord) {
//       return res.status(404).json({
//         success: false,
//         message: 'File not found'
//       });
//     }

//     // Read encrypted file
//     const encryptedFilePath = path.join(__dirname, '../uploads', fileRecord.encryptedName);
//     const encryptedContent = await fs.readFile(encryptedFilePath, 'utf8');

//     // Decrypt the content
//     let decryptedContent;
//     switch (fileRecord.algorithm) {
//       case 'AES':
//         decryptedContent = EncryptionService.aesDecrypt(encryptedContent, key);
//         break;
//       case 'DES':
//         decryptedContent = EncryptionService.desDecrypt(encryptedContent, key);
//         break;
//       case '3DES':
//         decryptedContent = EncryptionService.tripleDesDecrypt(encryptedContent, key);
//         break;
//       case 'BLOWFISH':
//         decryptedContent = EncryptionService.blowfishDecrypt(encryptedContent, key);
//         break;
//       default:
//         return res.status(400).json({
//           success: false,
//           message: 'Unsupported algorithm for file decryption'
//         });
//     }

//     // Convert back to buffer
//     const fileBuffer = Buffer.from(decryptedContent, 'base64');

//     // Set response headers for download
//     res.setHeader('Content-Type', fileRecord.mimeType);
//     res.setHeader('Content-Disposition', `attachment; filename="${fileRecord.originalName}"`);
//     res.setHeader('Content-Length', fileBuffer.length);

//     // Send the file
//     res.send(fileBuffer);
//   } catch (error) {
//     console.error('File download error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'File download failed: ' + error.message
//     });
//   }
// });

// // Get user's uploaded files
// router.get('/my-files', auth, async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const files = await FileRecord.find({ user: req.user._id })
//       .sort({ uploadDate: -1 })
//       .skip(skip)
//       .limit(limit)
//       .select('-key'); // Don't expose the key

//     const total = await FileRecord.countDocuments({ user: req.user._id });

//     res.json({
//       success: true,
//       files,
//       pagination: {
//         current: page,
//         pages: Math.ceil(total / limit),
//         total
//       }
//     });
//   } catch (error) {
//     console.error('Files fetch error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch files'
//     });
//   }
// });

// // Delete file
// router.delete('/:fileId', auth, async (req, res) => {
//   try {
//     const { fileId } = req.params;

//     const fileRecord = await FileRecord.findOne({ 
//       _id: fileId, 
//       user: req.user._id 
//     });

//     if (!fileRecord) {
//       return res.status(404).json({
//         success: false,
//         message: 'File not found'
//       });
//     }

//     // Delete physical file
//     const filePath = path.join(__dirname, '../uploads', fileRecord.encryptedName);
//     await fs.unlink(filePath).catch(console.error);

//     // Delete database record
//     await FileRecord.findByIdAndDelete(fileId);

//     res.json({
//       success: true,
//       message: 'File deleted successfully'
//     });
//   } catch (error) {
//     console.error('File deletion error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'File deletion failed'
//     });
//   }
// });

// module.exports = router;

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const CryptoJS = require('crypto-js');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const FileRecord = require('../models/FileRecord');
const router = express.Router();

// Enhanced Encryption Service - Added directly to files.js
class EncryptionService {
  // AES Encryption with different key sizes
  static aesEncrypt(text, key, keySize = 256) {
    try {
      // Convert key to proper format based on key size
      let formattedKey;
      if (keySize === 128) {
        formattedKey = CryptoJS.enc.Utf8.parse(key.padEnd(16, '0').substring(0, 16));
      } else if (keySize === 192) {
        formattedKey = CryptoJS.enc.Utf8.parse(key.padEnd(24, '0').substring(0, 24));
      } else {
        formattedKey = CryptoJS.enc.Utf8.parse(key.padEnd(32, '0').substring(0, 32));
      }
      
      const encrypted = CryptoJS.AES.encrypt(text, formattedKey, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        iv: CryptoJS.enc.Utf8.parse(key.padEnd(16, '0').substring(0, 16))
      });
      
      return encrypted.toString();
    } catch (error) {
      throw new Error(`AES-${keySize} encryption failed: ${error.message}`);
    }
  }

  static aesDecrypt(ciphertext, key, keySize = 256) {
    try {
      let formattedKey;
      if (keySize === 128) {
        formattedKey = CryptoJS.enc.Utf8.parse(key.padEnd(16, '0').substring(0, 16));
      } else if (keySize === 192) {
        formattedKey = CryptoJS.enc.Utf8.parse(key.padEnd(24, '0').substring(0, 24));
      } else {
        formattedKey = CryptoJS.enc.Utf8.parse(key.padEnd(32, '0').substring(0, 32));
      }

      const decrypted = CryptoJS.AES.decrypt(ciphertext, formattedKey, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        iv: CryptoJS.enc.Utf8.parse(key.padEnd(16, '0').substring(0, 16))
      });
      
      const result = decrypted.toString(CryptoJS.enc.Utf8);
      if (!result) throw new Error('Invalid key or corrupted data');
      return result;
    } catch (error) {
      throw new Error(`AES-${keySize} decryption failed: ${error.message}`);
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

// Upload and encrypt file
router.post('/upload-encrypt', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { algorithm, key } = req.body;
    
    if (!algorithm || !key) {
      // Clean up uploaded file
      await fs.unlink(req.file.path).catch(console.error);
      return res.status(400).json({
        success: false,
        message: 'Algorithm and key are required'
      });
    }

    // Read the uploaded file
    const fileBuffer = await fs.readFile(req.file.path);
    const fileContent = fileBuffer.toString('base64');

    // Encrypt the file content
    let encryptedContent;
    const algorithmUpper = algorithm.toUpperCase();

    try {
      switch (algorithmUpper) {
        case 'AES-128':
          encryptedContent = EncryptionService.aesEncrypt(fileContent, key, 128);
          break;
        case 'AES-192':
          encryptedContent = EncryptionService.aesEncrypt(fileContent, key, 192);
          break;
        case 'AES-256':
        case 'AES':
          encryptedContent = EncryptionService.aesEncrypt(fileContent, key, 256);
          break;
        case 'DES':
          encryptedContent = EncryptionService.desEncrypt(fileContent, key);
          break;
        case '3DES':
          encryptedContent = EncryptionService.tripleDesEncrypt(fileContent, key);
          break;
        case 'BLOWFISH':
          encryptedContent = EncryptionService.blowfishEncrypt(fileContent, key);
          break;
        default:
          await fs.unlink(req.file.path).catch(console.error);
          return res.status(400).json({
            success: false,
            message: 'Unsupported algorithm for file encryption'
          });
      }
    } catch (encryptionError) {
      await fs.unlink(req.file.path).catch(console.error);
      return res.status(400).json({
        success: false,
        message: `Encryption failed: ${encryptionError.message}`
      });
    }

    // Create encrypted file
    const encryptedFileName = `encrypted-${Date.now()}-${req.file.filename}`;
    const encryptedFilePath = path.join(path.dirname(req.file.path), encryptedFileName);
    
    await fs.writeFile(encryptedFilePath, encryptedContent);

    // Save file record to database
    const fileRecord = new FileRecord({
      user: req.user._id,
      originalName: req.file.originalname,
      encryptedName: encryptedFileName,
      mimeType: req.file.mimetype,
      size: req.file.size,
      algorithm: algorithmUpper,
      key: key
    });
    await fileRecord.save();

    // Remove original file
    await fs.unlink(req.file.path).catch(console.error);

    res.json({
      success: true,
      message: 'File encrypted successfully',
      fileInfo: {
        originalName: req.file.originalname,
        encryptedName: encryptedFileName,
        algorithm: algorithmUpper,
        size: req.file.size,
        encryptedSize: Buffer.from(encryptedContent).length,
        uploadDate: new Date()
      },
      downloadUrl: `/api/files/download/${fileRecord._id}`,
      saveUrl: `/api/files/save/${fileRecord._id}`
    });
  } catch (error) {
    console.error('File encryption error:', error);
    
    // Clean up files on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }

    res.status(500).json({
      success: false,
      message: 'File encryption failed: ' + error.message
    });
  }
});

// Download and decrypt file
router.get('/download/:fileId', auth, async (req, res) => {
  try {
    const { fileId } = req.params;
    const { key } = req.query;

    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'Decryption key is required'
      });
    }

    // Find file record
    const fileRecord = await FileRecord.findOne({ 
      _id: fileId, 
      user: req.user._id 
    });

    if (!fileRecord) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Read encrypted file
    const encryptedFilePath = path.join(__dirname, '../uploads', fileRecord.encryptedName);
    const encryptedContent = await fs.readFile(encryptedFilePath, 'utf8');

    // Decrypt the content
    let decryptedContent;
    try {
      switch (fileRecord.algorithm) {
        case 'AES-128':
          decryptedContent = EncryptionService.aesDecrypt(encryptedContent, key, 128);
          break;
        case 'AES-192':
          decryptedContent = EncryptionService.aesDecrypt(encryptedContent, key, 192);
          break;
        case 'AES-256':
        case 'AES':
          decryptedContent = EncryptionService.aesDecrypt(encryptedContent, key, 256);
          break;
        case 'DES':
          decryptedContent = EncryptionService.desDecrypt(encryptedContent, key);
          break;
        case '3DES':
          decryptedContent = EncryptionService.tripleDesDecrypt(encryptedContent, key);
          break;
        case 'BLOWFISH':
          decryptedContent = EncryptionService.blowfishDecrypt(encryptedContent, key);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Unsupported algorithm for file decryption'
          });
      }
    } catch (decryptionError) {
      return res.status(400).json({
        success: false,
        message: `Decryption failed: ${decryptionError.message}`
      });
    }

    // Convert back to buffer
    const fileBuffer = Buffer.from(decryptedContent, 'base64');

    // Set response headers for download
    res.setHeader('Content-Type', fileRecord.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileRecord.originalName}"`);
    res.setHeader('Content-Length', fileBuffer.length);

    // Send the file
    res.send(fileBuffer);
  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({
      success: false,
      message: 'File download failed: ' + error.message
    });
  }
});

// Save encrypted file without decryption
router.get('/save/:fileId', auth, async (req, res) => {
  try {
    const { fileId } = req.params;

    // Find file record
    const fileRecord = await FileRecord.findOne({ 
      _id: fileId, 
      user: req.user._id 
    });

    if (!fileRecord) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Read encrypted file
    const encryptedFilePath = path.join(__dirname, '../uploads', fileRecord.encryptedName);
    
    // Set response headers for saving encrypted file
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="encrypted-${fileRecord.originalName}.enc"`);
    
    // Send the encrypted file
    res.sendFile(encryptedFilePath);
  } catch (error) {
    console.error('File save error:', error);
    res.status(500).json({
      success: false,
      message: 'File save failed: ' + error.message
    });
  }
});

// Get user's uploaded files
router.get('/my-files', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const files = await FileRecord.find({ user: req.user._id })
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(limit)
      .select('-key'); // Don't expose the key

    const total = await FileRecord.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      files,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Files fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch files'
    });
  }
});

// Delete file
router.delete('/:fileId', auth, async (req, res) => {
  try {
    const { fileId } = req.params;

    const fileRecord = await FileRecord.findOne({ 
      _id: fileId, 
      user: req.user._id 
    });

    if (!fileRecord) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Delete physical file
    const filePath = path.join(__dirname, '../uploads', fileRecord.encryptedName);
    await fs.unlink(filePath).catch(console.error);

    // Delete database record
    await FileRecord.findByIdAndDelete(fileId);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'File deletion failed'
    });
  }
});

module.exports = router;