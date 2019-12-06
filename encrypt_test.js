const eccrypto = require("eccrypto");
const ethers = require('ethers');
const publicKeyConvert = require('secp256k1').publicKeyConvert;

let wallet1 = new ethers.Wallet.fromMnemonic("swap robust expect kid alarm ten icon sign such forward script voice");
let wallet2 = new ethers.Wallet.fromMnemonic("shine trend peasant winter coast room december exit snap soul abandon fresh");
// console.log(wallet1.signingKey.publicKey);

/**
 * @method encryptWithPublicKey
 * @param {String} pubKey - Compressed 33byte public key starting with 0x03 or 0x02
 * @param {Object} message - message object to encrypt
 * @returns {String} - Stringified cipher
 */
function encryptWithPublicKey(pubKey, message) {
  pubKey = pubKey.substring(2)
  pubKey = publicKeyConvert(new Buffer.from(pubKey, 'hex'), false).toString('hex')
  pubKey = new Buffer.from(pubKey, 'hex')
  return eccrypto.encrypt(
    pubKey,
    Buffer.from(message)
  ).then(encryptedBuffers => {
    const cipher = {
      iv: encryptedBuffers.iv.toString('hex'),
      ephemPublicKey: encryptedBuffers.ephemPublicKey.toString('hex'),
      ciphertext: encryptedBuffers.ciphertext.toString('hex'),
      mac: encryptedBuffers.mac.toString('hex')
    };
    // use compressed key because it's smaller
    const compressedKey = publicKeyConvert(new Buffer.from(cipher.ephemPublicKey, 'hex'), true).toString('hex')

    const ret = Buffer.concat([
      new Buffer.from(cipher.iv, 'hex'), // 16bit
      new Buffer.from(compressedKey, 'hex'), // 33bit
      new Buffer.from(cipher.mac, 'hex'), // 32bit
      new Buffer.from(cipher.ciphertext, 'hex') // var bit
    ]).toString('hex')

    return ret
  });
}

/**
 * @method decryptWithPrivateKey decript an EC publicKey encrypted message with the associated private key
 * @param {String} privateKey - the privatekey to decrypt with, including '0x' prefix
 * @param {String} encrypted - the stringified cipher to decrypt
 * @returns {Object} - the decrypted message
 */

function decryptWithPrivateKey(privateKey, encrypted) {
  const buf = new Buffer.from(encrypted, 'hex');
  encrypted = {
    iv: buf.toString('hex', 0, 16),
    ephemPublicKey: buf.toString('hex', 16, 49),
    mac: buf.toString('hex', 49, 81),
    ciphertext: buf.toString('hex', 81, buf.length)
  };
  // decompress publicKey
  encrypted.ephemPublicKey = publicKeyConvert(new Buffer.from(encrypted.ephemPublicKey, 'hex'), false).toString('hex')
  const twoStripped = privateKey.substring(2)
  const encryptedBuffer = {
    iv: new Buffer.from(encrypted.iv, 'hex'),
    ephemPublicKey: new Buffer.from(encrypted.ephemPublicKey, 'hex'),
    ciphertext: new Buffer.from(encrypted.ciphertext, 'hex'),
    mac: new Buffer.from(encrypted.mac, 'hex')
  };
  return eccrypto.decrypt(
    new Buffer.from(twoStripped, 'hex'),
    encryptedBuffer
  ).then(decryptedBuffer => decryptedBuffer.toString());
}

(async ()=>{
  let ct = await encryptWithPublicKey(wallet1.signingKey.publicKey, "asdf");
  console.log(ct);
  console.log(await decryptWithPrivateKey(wallet1.privateKey, ct));

})();
