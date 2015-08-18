/**
 * It is an sha1 hash generator
 * given a certain user password
 * it generates the key used
 * to encrypt the user private data
 *
 * Please be aware that a dictionary attack will still be possible,
 * and that this has to be improved
 *   http://stackoverflow.com/questions/19862691/using-sha-1-hash-as-aes-key
 */
var UserKey = (function () {
  var sha1 = require('sha1');
  //TODO add some salt

  // Define our UserKey object
  function UserKey () {
    this.hash = sha1;
  };

  return {
    hash: sha1
  }
}
)();

module.exports = UserKey;
