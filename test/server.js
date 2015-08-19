var http = require('http'),
    express = require('express'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;


var SerenoStrategy = require('../lib').init(LocalStrategy);


var localStrategy = new SerenoStrategy(
  function(username, password, done) {
    console.log('authenticate');
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
);

function mockEndpoint(req,res) {
  res.status(200).json({ message: 'tout va bien' });
}


function listen(port) {
  var app = express();
  app.use(passport.initialize());
  var router = express.Router();

  app.set('port', process.env.PORT || port);

passport.use(localStrategy);
//  passport.use(new SerenoStrategy());

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
