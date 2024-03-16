const crypto = require('crypto');
const lowAsciiLimit = 47; // letter '/'
const highAsciiLimit = 126;

function generateIv() {
  const ivLength = 16;
  let finalIvBuffer = '';
  for (let i = 0; i < ivLength; i++) {
    const randomNumber = Math.floor(Math.random() * (highAsciiLimit - lowAsciiLimit + 1) + lowAsciiLimit);
    finalIvBuffer += String.fromCharCode(randomNumber);
  }
  return finalIvBuffer;
}

function encrypt(dataToEncrypt, secretHexKey) {
  try {
    const secretKeyBuffer = Buffer.from(secretHexKey, 'hex');
    const initVector = generateIv();
    console.log(initVector.length);
    console.log('Dynamic IV:', initVector);
    const ivSpec = Buffer.from(initVector, 'utf8');
    const cipher = crypto.createCipheriv('aes-128-cbc', secretKeyBuffer, ivSpec);
    let encryptedPayload = cipher.update(dataToEncrypt, 'utf8', 'base64');
    encryptedPayload += cipher.final('base64');
    const finalEncryptedPayload = encryptedPayload;
    return finalEncryptedPayload;
  } catch (error) {
    console.error(error);
    return '';
  }
}



function decrypt(encrypted, secretKey) {
  try {
    let decryptedText = '';

    const secretKeyHexbytes = Buffer.from(secretKey, 'hex');

    let algorithm;
    if (secretKeyHexbytes.length === 32) {
      algorithm = 'aes-256-cbc';
    } else if (secretKeyHexbytes.length === 24) {
      algorithm = 'aes-192-cbc';
    } else if (secretKeyHexbytes.length === 16) {
      algorithm = 'aes-128-cbc';
    } else {
      throw new Error('Invalid Key Length, Must be 16/24/32 bytes');
    }

    const encryptedCombinedBytes = Buffer.from(encrypted, 'base64');

    const iv = encryptedCombinedBytes.slice(0, 16);

    const encryptedPayload = encryptedCombinedBytes.slice(16);

    const decipher = crypto.createDecipheriv(algorithm, secretKeyHexbytes, iv);

    let decryptedBytes = decipher.update(encryptedPayload);
    decryptedBytes = Buffer.concat([decryptedBytes, decipher.final()]);

    decryptedText = decryptedBytes.toString();

    return decryptedText;
  } catch (error) {
    console.error(error.message);
    return '';
  }
}


module.exports = {
  encrypt,
  decrypt
};