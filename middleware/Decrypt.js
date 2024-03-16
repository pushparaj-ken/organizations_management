const crypto = require('crypto');

const secretHexKey = process.env.secretHexKey;


const decryptRequestBody = (req, res, next) => {
  let decryptedText = '';
  console.log("TCL: decryptRequestBody -> req", req.body)

  const secretKeyHexbytes = Buffer.from(secretHexKey, 'hex');

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

  const encryptedCombinedBytes = Buffer.from(req.body, 'base64');

  const iv = encryptedCombinedBytes.slice(0, 16);

  const encryptedPayload = encryptedCombinedBytes.slice(16);

  const decipher = crypto.createDecipheriv(algorithm, secretKeyHexbytes, iv);

  let decryptedBytes = decipher.update(encryptedPayload);
  decryptedBytes = Buffer.concat([decryptedBytes, decipher.final()]);

  decryptedText = decryptedBytes.toString();
  req.body = JSON.parse(decryptedText);
  next();
};



module.exports = decryptRequestBody
