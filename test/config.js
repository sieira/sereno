'use strict';

/**
 * Import
 */
var mongoose = require('mongoose'),
    passport = require('passport'),
    mocha_mongoose = require('mocha-mongoose'),
    LocalStrategy = require('passport-local').Strategy,
    SerenoStrategy = require('../lib').init(LocalStrategy);

var config = {};

/**
 * Sample messages
 */
config.messages = {},
config.messages.message = "En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero , adarga antigua, rocín flaco y galgo corredor . Una olla de algo más vaca que carnero, salpicón las más noches, duelos y quebrantos los sábados , lantejas los viernes, algún palomino de añadidura los domingos, consumían las tres partes de su hacienda . El resto della concluían sayo de velarte, calzas de velludo para las fiestas, con sus pantuflos de lo mesmo, y los días de entresemana se honraba con su vellorí de lo más fino. Tenía en su casa una ama que pasaba de los cuarenta, y una sobrina que no llegaba a los veinte, y un mozo de campo y plaza , que así ensillaba el rocín como tomaba la podadera. Frisaba la edad de nuestro hidalgo con los cincuenta años; era de complexión recia, seco de carnes, enjuto de rostro, gran madrugador y amigo de la caza. Quieren decir que tenía el sobrenombre de Quijada, o Quesada, que en esto hay alguna diferencia en los autores que deste caso escriben ; aunque, por conjeturas verosímiles, se deja entender que se llamaba Quejana. Pero esto importa poco a nuestro cuento; basta que en la narración dél no se salga un punto de la verdad. ",
config.messages.message1 = config.messages.message,
config.messages.message2 = "It's a dangerous business, Frodo, going out your door. You step onto the road, and if you don't keep your feet, there's no knowing where you might be swept off to. ― J.R.R. Tolkien, The Lord of the Rings  ";

/**
 * Sample users
 */
config.users = {},
config.users.user = "Guybrush Threepwood",
config.users.password = "how appropriate. you fight like a cow",
config.users.wronguser = "user",
config.users.wrongpassword = "password1234";

/**
 * Mongo config
 **/
config.mongo = {},
config.mongo.dbURI = 'mongodb://localhost/sereno-test',
config.mongo.User = mongoose.model('User',
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
config.mongo.clearDB  = mocha_mongoose(config.mongo.dbURI,{noClear: true}),
config.mongo.connectDB = function(callback) {
  if (mongoose.connection.db) return callback();
  mongoose.connect(config.mongo.dbURI, callback);
};

/**
 * Chryptography stuff
 **/
config.crypto = {},
config.crypto.SessionKey = require('../lib/sessionKey'),
config.crypto.UserKeyGenerator = require('../lib/crypto/userKeyGenerator'),
config.crypto.PrivateDataEncrypter = require('../lib/crypto/privateDataEncrypter');

/**
 * Server parameters
 */
config.server = {},
config.server.hostname = 'localhost',
config.server.port = 2409;

/**
 * Strategy
 **/
passport.serializeUser(function(user, done) {
  //TODO this should go to sereno
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

config.strategy = {},
config.strategy.SerenoLocalStrategy = new SerenoStrategy({
    //TODO adapt it so it can use different names for the username and password fields
    session: false
  },
  function (username, password, done) {
    config.mongo.User.findOne({ username: username }, function(err, user) {
      if (err) {console.log('error');  return done(err); }

      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (user.password !== password) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
),
config.strategy.SessionLocalStrategy = new SerenoStrategy(
  {
    session: true
  },
   function (username, password, done) {
     config.mongo.User.findOne({ username: username }, function(err, user) {
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

module.exports = config;
