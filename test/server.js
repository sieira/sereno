var http = require('http'),
    express = require('express'),
    passport = require('passport'),
    bodyParser = require('body-parser'),
    LocalStrategy = require('passport-local').Strategy;


var SerenoStrategy = require('../lib').init(LocalStrategy);


// Dummy strategy (it will be overwritten from the tests)
var serenoLocalStrategy = new SerenoStrategy(function(username, password, done) {});

function mockEndpoint(req,res) {
  res.status(200).json({ message: 'tout va bien' });
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

  passport.use(serenoLocalStrategy);

  app.get('/private-data', passport.authenticate('sereno', { successRedirect: '/',
                                   failureRedirect: '/login' }));

  app.post('/login', passport.authenticate('sereno'), mockEndpoint);

  app.get('*', mockEndpoint);
  app.post('*', function(req,res) {
    res.status(404).json({ message: 'unknown request' });
  });

  // Start it up!
  http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  })
};

//TODO gracefully close connection (deleting all the stored keys)

module.exports = {
  listen: listen
};
