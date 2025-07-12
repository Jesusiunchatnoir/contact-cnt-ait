import CryptoJS from 'crypto-js';

export const generateKeyPair = () => {
  // Generate a random encryption key for this session
  const privateKey = CryptoJS.lib.WordArray.random(256/8).toString();
  const publicKey = CryptoJS.SHA256(privateKey).toString();
  
  return {
    privateKey,
    publicKey
  };
};

export const encryptMessage = (message: string, key: string): string => {
  try {
    const encrypted = CryptoJS.AES.encrypt(message, key).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return message; // Fallback to plain text
  }
};

export const decryptMessage = (encryptedMessage: string, key: string): string => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedMessage, key);
    const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
    return plaintext || encryptedMessage; // Fallback if decryption fails
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedMessage; // Fallback to encrypted text
  }
};

export const hashRoomId = (roomId: string): string => {
  return CryptoJS.SHA256(roomId).toString();
};