/**
 * This is an aes encrypter
 * It is intended to be used to hide the
 * user's private data given a userKey
 */
var PrivateDataEncrypter = (function () {
  //import crypto modules
  var crypto = require('crypto'),
      node_cryptojs = require('node-cryptojs-aes'),
      CryptoJS = node_cryptojs.CryptoJS,
      JsonFormatter = node_cryptojs.JsonFormatter;// custom json serialization format

  /*
  // encrypt plain text with passphrase and custom json serialization format, return CipherParams object
  // r_pass_base64 is the passphrase generated from first stage
  // message is the original plain text
  */
  function encrypt (sessionKey,message) {
    var AES = CryptoJS.AES, // node-cryptojs-aes main object;
              encrypted = AES.encrypt(message, sessionKey, { format: JsonFormatter });

    return encrypted;
  };

  function decrypt (sessionKey, encryptedMessage) {
    var AES = node_cryptojs.CryptoJS.AES, // node-cryptojs-aes main object;
        decrypted = AES.decrypt(encryptedMessage, sessionKey, { format: JsonFormatter });

    return CryptoJS.enc.Utf8.stringify(decrypted);
  };

  // Define our SessionKey object
  return {
    // Encryption and decription will be performed using the generated key
    encrypt : encrypt,
    decrypt : decrypt
  };
})();

module.exports = PrivateDataEncrypter;
