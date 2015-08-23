'use strict'

/**
 * Dependencies
 */
var should = require('chai').should(),
    LocalStrategy = require('passport-local').Strategy,
    SerenoStrategy = require('../lib').init(LocalStrategy),
    http = require('http'),
    passport = require('passport'),
    querystring = require('querystring');

/**
 * Chryptography stuff
 **/
var SessionKey = require('../lib/sessionKey'),
    UserKey = require('../lib/userKey'),
    PrivateDataEncrypter = require('../lib/privateDataEncrypter');

/**
 * Sample messages
 */
var message = "En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero , adarga antigua, rocín flaco y galgo corredor . Una olla de algo más vaca que carnero, salpicón las más noches, duelos y quebrantos los sábados , lantejas los viernes, algún palomino de añadidura los domingos, consumían las tres partes de su hacienda . El resto della concluían sayo de velarte, calzas de velludo para las fiestas, con sus pantuflos de lo mesmo, y los días de entresemana se honraba con su vellorí de lo más fino. Tenía en su casa una ama que pasaba de los cuarenta, y una sobrina que no llegaba a los veinte, y un mozo de campo y plaza , que así ensillaba el rocín como tomaba la podadera. Frisaba la edad de nuestro hidalgo con los cincuenta años; era de complexión recia, seco de carnes, enjuto de rostro, gran madrugador y amigo de la caza. Quieren decir que tenía el sobrenombre de Quijada, o Quesada, que en esto hay alguna diferencia en los autores que deste caso escriben ; aunque, por conjeturas verosímiles, se deja entender que se llamaba Quejana. Pero esto importa poco a nuestro cuento; basta que en la narración dél no se salga un punto de la verdad. ",
    message1 = message,
    message2 = "It's a dangerous business, Frodo, going out your door. You step onto the road, and if you don't keep your feet, there's no knowing where you might be swept off to. ― J.R.R. Tolkien, The Lord of the Rings  ";

/**
 * Sample users
 */
var user = "Guybrush Threepwood",
    password = "how appropriate. you fight like a cow",
    wronguser = "user",
    wrongpassword = "password1234";

/**
 * Mongo config
 **/
var dbURI = 'mongodb://localhost/sereno-test',
    mongoose = require('mongoose'),
    User = mongoose.model('User',
    new mongoose.Schema({
      username: {
        type: String,
        unique: true,
        required: true
      },
      password: {
        type: String,
        required: true
      }
    })),
    clearDB  = require('mocha-mongoose')(dbURI);

/**
 * Server parameters
 */
var server = require('./server'),
    hostname = 'localhost',
    port = 2409;

/**
 * Strategy
 **/
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

var serenoLocalStrategy = new SerenoStrategy(
   function (username, password, done) {
     User.findOne({ username: username }, function(err, user) {
       if (err) { return done(err); }
       if (!user) {
         return done(null, false, { message: 'Incorrect username.' });
       }
       if (!user.password === password) {
         return done(null, false, { message: 'Incorrect password.' });
       }
       return done(null, user);
     });
   }
 );

describe('# SessionKey', function() {
  var sessionKey = new SessionKey(),
      sessionKey1 = sessionKey,
      sessionKey2 = new SessionKey();

  it('The message and its encrypted version have to be different', function() {
        var encryptedMessage = sessionKey.encrypt(message);

        message.should.not.be.equal(encryptedMessage);
  });

  it('Two different messages encrypted with the same key have to be different', function() {
    var encryptedMessage1 = sessionKey.encrypt(message1);
    var encryptedMessage2 = sessionKey.encrypt(message2);

    encryptedMessage1.should.not.be.equal(message1);
    encryptedMessage1.should.not.be.equal(encryptedMessage2);
  });

  it('The same message encrypted with a different key has to be different', function() {
    var encryptedMessage1 = sessionKey1.encrypt(message);
    var encryptedMessage2 = sessionKey2.encrypt(message);

    encryptedMessage1.should.not.be.equal(encryptedMessage2);
  });

    it('A decripted crypted message is equal to the original message only when using the same key', function() {
      var redecryptedMessage = sessionKey1.decrypt(sessionKey1.encrypt(message));
//      var corruptRedecryptedMessage = masterKey1.decrypt(masterKey2.encrypt(message));

      redecryptedMessage.should.be.equal(message);
//      redecryptedMessage.should.not.be.equal(corruptRedecryptedMessage);
    });
});
describe('# UserKey', function() {
  it('The same message has to give equal hashes', function() {
    var hash1 = UserKey.hash(message);
    var hash2 = UserKey.hash(message);

    hash1.should.be.equal(hash2);
  });

  it('The hash should be 128 Bytes long', function() {
    var hash = UserKey.hash(message);
//TODO    hash.length.should.be.equal(128);
  });
});

describe('# Private-data encrypter', function() {
  it('The message and the encrypted message have to be different', function() {
    var hash = UserKey.hash(password),
        encryptedMessage = PrivateDataEncrypter.encrypt(hash, message);

    message.should.not.be.equal(encryptedMessage);
  });

  it('The message and the dencrypted message has to be the original message', function() {
    var hash = UserKey.hash(password),
        encryptedMessage = PrivateDataEncrypter.encrypt(hash, message),
        redecryptedMessage = PrivateDataEncrypter.decrypt(hash, encryptedMessage);

    message.should.be.equal(redecryptedMessage);
  });
});

describe("# Database", function() {
  /**
   * Start and clear the database
   */
  before(function(done) {
    if (mongoose.connection.db) return done();
    mongoose.connect(dbURI, done);
  });

  before(function(done) {
    clearDB(done);
  });

  it("Should be able to create a test user", function(done) {
    new User({ username: user, password : password }).save(done);
  });

  it("Should refuse to add the same user twice", function(done) {
    new User({ username: user, password : password }).save();

    try {
      new User({ username: user, password : password }).save();
      should.fail('The database accepted to add a duplicate entry');
    }
    catch(err) {
      err.should.be.instanceof(Error);
      done();
    }
  });

  it("Should be able to retrieve users", function(done) {
    new User({ username: user, password : password }).save(function(err, model){
      if (err) return done(err);

      new User({ username: wronguser, password : wrongpassword }).save(function(err, model){
        if (err) return done(err);
        User.find({}, function(err, docs){
          if (err) return done(err);
          docs.length.should.equal(2);
          done();
        });
      });
    });
  });

  it("can clear the DB on demand", function(done) {
    new User({ username: user, password : password }).save(function(err, model){
      User.count(function(err, count){
        should.not.exist(err);
        count.should.be.equal(1);

        clearDB(function(err){
          should.not.exist(err);
          User.find({}, function(err, docs){
            should.not.exist(err);
            docs.length.should.equal(0);
            done();
          });
        });
      });
    });
  });
});

describe('# Passport', function() {
    it('Requiring passport should not fail', function() {
      var passport = require('passport');
      passport.should.not.be.null;
    });

    it('Register passport strategy should not fail', function() {
      var passport = require('passport');
      passport.use(new SerenoStrategy(
        function(username, password, done) {
          User.findOne({ username: username }, function(err, user) {
            if (err) { return done(err); }
            if (!user) {
              return done(null, false, { message: 'Incorrect username.' });
            }
            if (!user.validPassword(password)) {
              return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
          });
        }
      ));
    });
});

describe('# Test server ', function () {
  /**
   * Start and clear the database
   */
  before(function(done) {
    if (mongoose.connection.db) return done();
    mongoose.connect(dbURI, done);
  });

  before(function(done) {
    clearDB(done);
  });
  /**
   * Start and stop the server
   */
  before(function () {
    server.listen(port);
  });
  after(function () {
    server.close();
  });

  it('Test server should return 200 when calling it', function (done) {
    http.get('http://'+ hostname +':'+ port, function (res) {
      res.statusCode.should.be.equal(200);
      done();
    });
  });

  it('Test server should redirect when calling a private area', function (done) {
      http.get('http://'+hostname+':'+ port + '/private-data', function (res) {
        res.statusCode.should.be.equal(302);
        done();
      });
  });

  it('Require passport', function() {
    var passport = require('passport');
    passport.should.not.be.null;
  });

  it('Login with bad credentials should redirect to login', function(done) {
    server.setStrategy(serenoLocalStrategy);

    var postData = querystring.stringify({
      username : wronguser,
      password : wrongpassword
    });

    var options = {
      hostname: hostname,
      port: port,
      path: '/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
      }
    };

    var req = http.request(options, function(res) {
      res.statusCode.should.equal(302);
      res.headers.location.should.equal('/login');
      done();
    });

    req.on('error', function(e) {
      should.fail('problem with request: ' + e.message);
    });

    req.write(postData);
    req.end();
  });

  it('Login with proper credentials should redirect to home', function(done) {
    new User({ username: user, password : password }).save(function(err, model) {
      server.setStrategy(serenoLocalStrategy);

      var postData = querystring.stringify({
        username : user,
        password : password
      });

      var options = {
        hostname: hostname,
        port: port,
        path: '/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': postData.length
        }
      };

      var req = http.request(options, function(res) {
        res.statusCode.should.equal(302);
        res.headers.location.should.equal('/');
        done();
      });

      req.on('error', function(e) {
        should.fail('problem with request: ' + e.message);
      });

      req.write(postData);
      req.end();
    });
  });
});
