'use strict'

/**
 * Dependencies
 */
var should = require('chai').should(),
    config = require('./config'),
    http = require('http'),
    passport = require('passport'),
    server = require('./server'),
    querystring = require('querystring');

/**
 * Import config
 */
var message = config.messages.message,
    message1 = config.messages.message1,
    message2 = config.messages.message2,

    user = config.users.user,
    password = config.users.password,
    wronguser = config.users.wronguser,
    wrongpassword = config.users.wrongpassword,

    dbURI = config.mongo.dbURI,
    User = config.mongo.User,
    clearDB = config.mongo.clearDB,

    SessionKey = config.crypto.SessionKey,
    UserKeyGenerator = config.crypto.UserKeyGenerator,
    PrivateDataEncrypter = config.crypto.PrivateDataEncrypter,

    hostname = config.server.hostname,
    port = config.server.port,

    serenoLocalStrategy = config.strategy.serenoLocalStrategy;


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
    var hash1 = UserKeyGenerator.hash(message);
    var hash2 = UserKeyGenerator.hash(message);

    hash1.should.be.equal(hash2);
  });

  it('The hash should be 128 Bytes long', function() {
    var hash = UserKeyGenerator.hash(message);
//TODO    hash.length.should.be.equal(128);
  });
});

describe('# Private-data encrypter', function() {
  it('The message and the encrypted message have to be different', function() {
    var hash = UserKeyGenerator.hash(password),
        encryptedMessage = PrivateDataEncrypter.encrypt(hash, message);

    message.should.not.be.equal(encryptedMessage);
  });

  it('The message and the dencrypted message has to be the original message', function() {
    var hash = UserKeyGenerator.hash(password),
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
    config.mongo.connectDB(done);
  });

  before(function(done) {
    config.mongo.clearDB(done);
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

  it("Can clear the DB on demand", function(done) {
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
      passport.use(serenoLocalStrategy);
    });
});

describe('# Test server ', function () {
  /**
   * Start and clear the database
   */
  before(function(done) {
    config.mongo.connectDB(done);
  });

  before(function(done) {
    config.mongo.clearDB(done);
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
      http.get('http://'+ hostname +':'+ port + '/private-data', function (res) {
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

describe('# Sereno: Here is where the fun starts ', function () {
  /**
   * Start and clear the database
   */
  before(function(done) {
    config.mongo.connectDB(done);
  });

  before(function(done) {
        config.mongo.clearDB(done);
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

  var encryptedMessage;

  it('Requesting an encrypted message', function(done) {
    new User({ username: user, password : password }).save(function(err, model) {
      server.setStrategy(serenoLocalStrategy);

      var postData = querystring.stringify({
        username : user,
        password : password,
        message : message
      });

      var options = {
        hostname: hostname,
        port: port,
        path: '/encrypt',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': postData.length
        }
      };

      var req = http.request(options, function(res) {
        res.statusCode.should.equal(200);

        res.on('data', function(data) {
          encryptedMessage = JSON.parse(data).message;
          encryptedMessage.should.not.equal(message);
          done();
        });
      });

      req.on('error', function(e) {
        should.fail('problem with request: ' + e.message);
        done();
      });

      req.write(postData);
      req.end();
    });
  });

  it('Decrypt the encrypted message', function(done) {
    new User({ username: user, password : password }).save(function(err, model) {
      server.setStrategy(serenoLocalStrategy);

      var postData = querystring.stringify({
        username : user,
        password : password,
        message : encryptedMessage
      });

      var options = {
        hostname: hostname,
        port: port,
        path: '/decrypt',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': postData.length
        }
      };

      var req = http.request(options, function(res) {
        res.statusCode.should.equal(200);

        res.on('data', function(data) {
          var decryptedMessage = JSON.parse(data).message;
          decryptedMessage.should.equal(message);
          done();
        });
      });

      req.on('error', function(e) {
        should.fail('problem with request: ' + e.message);
        done();
      });

      req.write(postData);
      req.end();
    });
  });
});
