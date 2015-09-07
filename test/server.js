'use strict'

var http = require('http'),
    express = require('express'),
    passport = require('passport'),
    bodyParser = require('body-parser'),
    LocalStrategy = require('passport-local').Strategy;

var server;

var SerenoStrategy = require('../lib').init(LocalStrategy);


// TODO Dummy strategy (it will be overwritten from the tests)
var DummyStrategy = new SerenoStrategy(function(username, password, done) {});

function mockEndpoint(status,message) {
    return function (req,res) {
      res.status(status).json({ message: message });
    }
}

function setStrategy(Strategy) {
  passport.use(Strategy);
}

function listen(port, callback) {
  var app = express();
  var router = express.Router();

  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }));

  // parse application/json
  app.use(bodyParser.json());

  app.use(passport.initialize());
  app.use(passport.session());

  app.set('port', process.env.PORT || port);

  app.get('/private-data', passport.authenticate('sereno', { failureRedirect: '/login' }),  mockEndpoint(200,"tout va bien"));

  app.post('/login', passport.authenticate('sereno', { successRedirect: '/', failureRedirect: '/login' }));

//TODO you shouldn't need to instantiate a sereno strategy; there should be static stuff for that
  app.post('/encrypt', passport.authenticate('sereno'), DummyStrategy.encrypt);
  app.post('/decrypt', passport.authenticate('sereno'), DummyStrategy.decrypt);

  //app.post('/login', mockEndpoint(401,"Thou shall not pass"));

  app.get('*', mockEndpoint(200,"Tout se passe comme il faut"));
  app.post('*', function(req,res) {
    res.status(404).json({ message: 'unknown request' });
  });

  // Start it up!
  server = http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
    if(callback) return callback();
  })
};

//TODO gracefully close connection (deleting all the stored keys)
function close(callback) {
  server.close(callback);
}

module.exports = {
  setStrategy : setStrategy,
  listen: listen,
  close: close
};
