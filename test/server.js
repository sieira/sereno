'use strict'

var http = require('http'),
    express = require('express'),
    passport = require('passport'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    LocalStrategy = require('passport-local').Strategy;

var server;
var app = express();

var SerenoStrategy = require('../lib');


function mockEndpoint(status,message) {
    return function (req,res) {
      res.status(status).json({ message: message });
    }
}

function setStrategy(Strategy) {
  passport.use(Strategy);
}

function enableSession() {
  // TODO This belongs to sereno. The secret should be randomly generated
  // along with the server key
  app.use(session({genid: function(req) {
    return genuuid() // use UUIDs for session IDs
  }, secret: "somethingSecret", cookie: { secure: true, maxAge: 60000 }, resave: false, saveUninitialized: true}));
}

function genuuid(req) {
  return "Test UID";
}

function listen(port, callback) {
  var router = express.Router();

  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }));

  // parse application/json
  app.use(bodyParser.json());
  app.use(passport.initialize());

  app.set('port', process.env.PORT || port);

  app.get('/private-data', passport.authenticate('sereno', { failureRedirect: '/login' }),  mockEndpoint(200,"tout va bien"));

  app.post('/login', passport.authenticate('sereno', { successRedirect: '/', failureRedirect: '/login' }));

//TODO you shouldn't need to instantiate a sereno strategy; there should be static stuff for that
  app.post('/encrypt', passport.authenticate('sereno'), SerenoStrategy.encrypt);
  app.post('/decrypt', passport.authenticate('sereno'), SerenoStrategy.decrypt);

  //app.post('/login', mockEndpoint(401,"Thou shall not pass"));

  app.get('/', mockEndpoint(200,'Index'));
  app.get('*', mockEndpoint(404,'OOOOPS'));
  app.post('*', mockEndpoint(404,'unknown request'));

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
  enableSession : enableSession,
  close: close
};
