'use strict'

var http = require('http'),
    express = require('express'),
    passport = require('passport'),
    bodyParser = require('body-parser'),
    LocalStrategy = require('passport-local').Strategy;

var server;

var SerenoStrategy = require('../lib').init(LocalStrategy);


// Dummy strategy (it will be overwritten from the tests)
var serenoLocalStrategy = new SerenoStrategy(function(username, password, done) {});

function mockEndpoint(status,message) {
    return function (req,res) {
      res.status(status).json({ message: message });
    }
}

function setStrategy(Strategy) {
  passport.use(Strategy);
}

function listen(port) {
  var app = express();

  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }));

  // parse application/json
  app.use(bodyParser.json());

  app.use(passport.initialize());
  var router = express.Router();

  app.set('port', process.env.PORT || port);

  app.get('/private-data', passport.authenticate('sereno', { failureRedirect: '/login' }),  mockEndpoint(200,"tout va bien"));

  app.post('/login', passport.authenticate('sereno', { successRedirect: '/', failureRedirect: '/login' }));

//TODO you shouldn't need to instantiate a sereno strategy; there should be static stuff for that
  app.post('/encrypt', passport.authenticate('sereno'), serenoLocalStrategy.encrypt);
  app.post('/decrypt', passport.authenticate('sereno'), serenoLocalStrategy.decrypt);

  //app.post('/login', mockEndpoint(401,"Thou shall not pass"));

  app.get('*', mockEndpoint(200,"Tout se passe comme il faut"));
  app.post('*', function(req,res) {
    res.status(404).json({ message: 'unknown request' });
  });

  // Start it up!
  server = http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  })
};

//TODO gracefully close connection (deleting all the stored keys)
function close() {
  server.close();
}

module.exports = {
  setStrategy : setStrategy,
  listen: listen,
  close: close
};
