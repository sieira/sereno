//TODO consider adding a constructor that given a password returns an object able to cypher and decypher using a hash of this password
//no salt can be added unless it's kept along with the encrypted data in the database, but this database may not exist
/**
 * This is an aes encrypter
 * It is intended to be used to hide the
 * user's private data given a unique key
 * deduced from user's immutable and secret data
 * such as his password
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
  function encrypt (key,message) {
    var AES = CryptoJS.AES, // node-cryptojs-aes main object;
              encrypted = AES.encrypt(message, key, { format: JsonFormatter });

    return encrypted;
  };

  function decrypt (key, encryptedMessage) {
    var AES = node_cryptojs.CryptoJS.AES, // node-cryptojs-aes main object;
        decrypted = AES.decrypt(encryptedMessage, key, { format: JsonFormatter });

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
