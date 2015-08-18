var http = require('http'),
    express = require('express'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    SerenoStrategy = require('../lib').Strategy;


var strategy = new LocalStrategy(function(username, password, done) {
  User.findOne({ emailAddress: username }, function(err, user) {
    if(err){
      return done(err);
    }
    if (!user) {
      return done(null, false, { message: 'Email ' + username + ' not found'});
    }
    else {
      //check if password matches and pass parameters in done accordingly
    }
  });
});

function mockEndpoint(req,res) {
  res.status(200).json({ message: 'tout va bien' });
}


function listen(port) {
  var app = express();
  app.use(passport.initialize());
  var router = express.Router();

  app.set('port', process.env.PORT || port);

  passport.use(new SerenoStrategy(strategy));

  app.get('/private-data', passport.authenticate('sereno', { successRedirect: '/',
                                   failureRedirect: '/login' }));
  app.get('*', mockEndpoint);

  // Start it up!
  http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  })
};

//TODO gracefully close connection (deleting all the stored keys)

module.exports = {
  listen: listen
};
