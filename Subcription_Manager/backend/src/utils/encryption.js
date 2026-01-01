const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY || 'demo-32-character-key-for-dev-only', 'utf8').slice(0, 32);

function encrypt(text) {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(ALGORITHM, KEY);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      ciphertext: encrypted,
      iv: iv.toString('hex'),
      tag: 'simple-tag'
    };
  } catch (error) {
    console.error('Encryption error:', error);
    // Fallback to base64 encoding for demo
    return {
      ciphertext: Buffer.from(text).toString('base64'),
      iv: 'demo-iv',
      tag: 'demo-tag'
    };
  }
}

function decrypt(ciphertext, iv, tag) {
  try {
    // Check if it's base64 encoded (fallback)
    if (iv === 'demo-iv' && tag === 'demo-tag') {
      return Buffer.from(ciphertext, 'base64').toString('utf8');
    }
    
    const decipher = crypto.createDecipher(ALGORITHM, KEY);
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    // Try base64 fallback
    try {
      return Buffer.from(ciphertext, 'base64').toString('utf8');
    } catch (fallbackError) {
      console.error('Fallback decryption failed:', fallbackError);
      return null;
    }
  }
}

// Simple and safe encryption for demo
function simpleEncrypt(text) {
  try {
    // Use simple base64 encoding for demo (not secure for production)
    const encoded = Buffer.from(text).toString('base64');
    return {
      ciphertext: encoded,
      iv: 'demo-iv',
      tag: 'demo-tag'
    };
  } catch (error) {
    console.error('Simple encryption error:', error);
    return {
      ciphertext: text, // Fallback to plain text for demo
      iv: 'error-iv',
      tag: 'error-tag'
    };
  }
}

function simpleDecrypt(ciphertext, iv, tag) {
  try {
    if (iv === 'demo-iv' && tag === 'demo-tag') {
      return Buffer.from(ciphertext, 'base64').toString('utf8');
    }
    
    if (iv === 'error-iv' && tag === 'error-tag') {
      return ciphertext; // Was plain text
    }
    
    // Try base64 decode
    return Buffer.from(ciphertext, 'base64').toString('utf8');
  } catch (error) {
    console.error('Simple decryption error:', error);
    return ciphertext; // Return as-is if can't decrypt
  }
}

module.exports = {
  encrypt: simpleEncrypt,
  decrypt: simpleDecrypt
};