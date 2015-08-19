var should = require('chai').should(),
    SessionKey = require('../lib/sessionKey'),
    UserKey = require('../lib/userKey'),
    PrivateDataEncrypter = require('../lib/privateDataEncrypter'),
    LocalStrategy = require('passport-local').Strategy,
    SerenoStrategy = require('../lib').init(LocalStrategy),
    http = require('http');

var message = "En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero , adarga antigua, rocín flaco y galgo corredor . Una olla de algo más vaca que carnero, salpicón las más noches, duelos y quebrantos los sábados , lantejas los viernes, algún palomino de añadidura los domingos, consumían las tres partes de su hacienda . El resto della concluían sayo de velarte, calzas de velludo para las fiestas, con sus pantuflos de lo mesmo, y los días de entresemana se honraba con su vellorí de lo más fino. Tenía en su casa una ama que pasaba de los cuarenta, y una sobrina que no llegaba a los veinte, y un mozo de campo y plaza , que así ensillaba el rocín como tomaba la podadera. Frisaba la edad de nuestro hidalgo con los cincuenta años; era de complexión recia, seco de carnes, enjuto de rostro, gran madrugador y amigo de la caza. Quieren decir que tenía el sobrenombre de Quijada, o Quesada, que en esto hay alguna diferencia en los autores que deste caso escriben ; aunque, por conjeturas verosímiles, se deja entender que se llamaba Quejana. Pero esto importa poco a nuestro cuento; basta que en la narración dél no se salga un punto de la verdad. ",
    message1 = message,
    message2 = "It's a dangerous business, Frodo, going out your door. You step onto the road, and if you don't keep your feet, there's no knowing where you might be swept off to. ― J.R.R. Tolkien, The Lord of the Rings  ";

var password = "user's password";

/**
 * Start the server
 */
var server = require('./server'),
    port = 2409;

describe('# SessionKey', function() {
  var sessionKey = new SessionKey(),
      sessionKey1 = sessionKey,
      sessionKey2 = new SessionKey();

  it('The message and it\'s encrypted version have to be different: ', function() {
        var encryptedMessage = sessionKey.encrypt(message);

        message.should.not.be.equal(encryptedMessage);
  });

  it('Two different messages encrypted with the same key have to be different: ', function() {
    var encryptedMessage1 = sessionKey.encrypt(message1);
    var encryptedMessage2 = sessionKey.encrypt(message2);

    encryptedMessage1.should.not.be.equal(message1);
    encryptedMessage1.should.not.be.equal(encryptedMessage2);
  });

  it('The same message encrypted with a different key has to be different: ', function() {
    var encryptedMessage1 = sessionKey1.encrypt(message);
    var encryptedMessage2 = sessionKey2.encrypt(message);

    encryptedMessage1.should.not.be.equal(encryptedMessage2);
  });

    it('A decripted crypted message is equal to the original message when only using the same key: ', function() {
      var redecryptedMessage = sessionKey1.decrypt(sessionKey1.encrypt(message));
//      var corruptRedecryptedMessage = masterKey1.decrypt(masterKey2.encrypt(message));

      redecryptedMessage.should.be.equal(message);
//      redecryptedMessage.should.not.be.equal(corruptRedecryptedMessage);
    });
});
describe('# UserKey', function() {
  it('The same message has to give equal hashes: ', function() {
    var hash1 = UserKey.hash(message);
    var hash2 = UserKey.hash(message);

    hash1.should.be.equal(hash2);
  });

  it('The hash has to be 128 Bytes long: ', function() {
    var hash = UserKey.hash(message);
//TODO    hash.length.should.be.equal(128);
  });
});

describe('# Private-data encrypter', function() {
  it('The message and the encrypted message have to be different : ', function() {
    var hash = UserKey.hash(password),
        encryptedMessage = PrivateDataEncrypter.encrypt(hash, message);

    message.should.not.be.equal(encryptedMessage);
  });

  it('The message and the dencrypted message has to be the original message : ', function() {
    var hash = UserKey.hash(password),
        encryptedMessage = PrivateDataEncrypter.encrypt(hash, message),
        redecryptedMessage = PrivateDataEncrypter.decrypt(hash, encryptedMessage);

    message.should.be.equal(redecryptedMessage);
  });
});

describe('# Server ', function () {
  before(function () {
    server.listen(port);
  });
  after(function () {
//TODO    server.close();
  });

  it('Test server should return 200 when calling it', function (done) {
    http.get('http://localhost:'+ port, function (res) {
      res.statusCode.should.be.equal(200);
      done();
    });
  });

  it('Test server should redirect when calling a private area', function (done) {
      http.get('http://localhost:'+ port + '/private-data', function (res) {
        res.statusCode.should.be.equal(302);
        done();
      });
  });
});

describe('# Passport', function() {
    it('Require passport : ', function() {
      var passport = require('passport');
      passport.should.not.be.null;
    });

    it('Register passport strategy : ', function() {
      var passport = require('passport');

      passport.use(new SerenoStrategy(function(username, password, done) {
          User.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
              return done(null, false, { message: 'Incorrect username.' });
            }
            if (!user.validPassword(password)) {
              return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
          });
        }));
    });
});
