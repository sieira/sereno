'use strict'

var http = require('http'),
    express = require('express'),
    passport = require('passport'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    LocalStrategy = require('passport-local').Strategy;
var SerenoStrategy = require('../lib');

function mockEndpoint(status, message) {
    return function (req, res) {
        res.status(status).json({message: message});
    }
}

function genuuid(req) {
    return "Test UID";
}

function Server(options) {
    var app = express();

    var isSessionEnabled = false;

    var server;

    this.setStrategy = function(Strategy) {
        passport.use(Strategy);
    }

    this.enableSession = function() {
        // TODO This belongs to sereno. The secret should be randomly generated
        // along with the server key
        app.use(session({
            genid: function (req) {
                return genuuid() // use UUIDs for session IDs
            }, secret: "somethingSecret", cookie: {secure: true, maxAge: 60000}, resave: false, saveUninitialized: true
        }));
    }

    this.listen = function(callback) {
        var router = express.Router();

        // parse application/x-www-form-urlencoded
        app.use(bodyParser.urlencoded({extended: false}));
        console.log(options.enableSession)
        if (options.enableSession) {
            console.log("Session enabled, adding session middleware")
            app.use(session({
                genid: function (req) {
                    return genuuid() // use UUIDs for session IDs
                },
                secret: "somethingSecret",
                cookie: {maxAge: 60000},
                resave: true,
                saveUninitialized: false
            }));
        }

        // parse application/json
        app.use(bodyParser.json());
        app.use(passport.initialize());

        app.set('port', process.env.PORT || options.port);

        app.get('/private-data', passport.authenticate('sereno', {failureRedirect: '/login'}), mockEndpoint(200, "tout va bien"));

        app.post('/login', passport.authenticate('sereno', {successRedirect: '/', failureRedirect: '/login'}));

        //TODO you shouldn't need to instantiate a sereno strategy; there should be static stuff for that
        app.post('/encrypt', passport.authenticate('sereno'), SerenoStrategy.encrypt);
        app.post('/decrypt', passport.authenticate('sereno'), SerenoStrategy.decrypt);

        //app.post('/login', mockEndpoint(401,"Thou shall not pass"));

        app.get('/', mockEndpoint(200, 'Index'));
        app.get('*', mockEndpoint(404, 'OOOOPS'));
        app.post('*', mockEndpoint(404, 'unknown request'));

        // Start it up!
        server = http.createServer(app).listen(app.get('port'), function () {
            console.log('Express server listening on port ' + app.get('port'));
            if (callback) return callback();
        })
    };

    //TODO gracefully close connection (deleting all the stored keys)
    this.close = function(callback) {
        server.close(callback);
    }
}


module.exports = Server;
