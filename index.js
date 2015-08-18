var SerenoStrategy = require('sereno');

/////// ONLY FOR TEST PURPOSES
var passport = require('passport');

var SessionKey = require('./sessionKey'),
    UserKey = require('./userKey'),
    PrivateDataEncrypter = require('./privateDataEncrypter');

var password = "This is so secret",
    message = "This text should never be know by anyone but me";

console.log('The server starts and generates a sessionKey');
var sessionKey = new SessionKey();

console.log('The user sends his password');
console.log('User autenticated, then generate userKey');
var userKey = UserKey.hash(password);
console.log('The user key is -> ' + userKey.slice(0,30));

console.log('The server encrypts the userKey and sends it to the database');
var encryptedUserKey = sessionKey.encrypt(userKey);

console.log('The user sends a new information he wants to keep safe');
console.log(' 1- Server gets the encryptedUserKey from the database');
console.log(' 2- Server uses the sessionKey to access the userKey');
console.log(' 3- The server uses the AES encrypter with this key to get the secure data');
var retreivedUserKey = sessionKey.decrypt(encryptedUserKey);
var encryptedMessage = PrivateDataEncrypter.encrypt(message);
console.log(encryptedMessage);
//////////////////////////////

var sereno = module.exports = exports = new SerenoStrategy;
