'use strict';

/**
 *
 * Why a strategy factory?
 * -----------------------
 *
 * The idea is to make Sereno be a wrapper for any other
 * given Strategy, so it can use whatever constant value
 * utilisable as key sereno can access to.
 *
 * In order to perform encryption, a constant value, unique to the user,
 *  has to be used as the origin of the encryption key, so the user can
 * perform the encryption only with his login.
 *
 * Whereas this data is retrievable from the user's request in some cases,
 * it's not the case for a third party authentication.
 *
 * It is therefore neccessary to bypass the passport strategy so the
 * data received from the external server (and not registered nor in the
 * request, nor in the response) can be catched and treated.
 *
 * ---------------------------------------------------------------
 * For a local strategy, it is suppossed to catch up the user's
 * password. And this will be the first thing to do before we go
 * to version 0.0.2 (19/08/2015)
 *
 **/
function init(Strategy) {
  var util = require('util'),
      lookup = require('./utils').lookup,
      userKeyGernerator = require('./crypto/userKeyGenerator'),
      privateDataEncrypter = require('./crypto/privateDataEncrypter');
  /**
   * `SerenoStrategy` constructor.
   *
   * @api public
   */
  function SerenoStrategy() {
    Strategy.apply(this,arguments);

    this.name = 'sereno';
  }

  /**
   * Inherit from `Strategy`.
   */
  util.inherits(SerenoStrategy, Strategy);

  /**
   * Encryption callback
   */
  SerenoStrategy.prototype.encrypt = function(req,res,next) {
    var password = lookup(req.body, 'password') || lookup(req.query, passwordField);

      /**
       * Add the password and the message to the request
       * so the callback can access them
       */
      if(password && req.body.message) {
        var userKey = userKeyGernerator.hash(password);
        var encryptedMessage = privateDataEncrypter.encrypt(userKey,req.body.message);

        return res.status(200).json({ message: encryptedMessage });
      }

      res.status(409).json({ message: 'the message could not be encrypted, no key found' });
  }

  SerenoStrategy.prototype.decrypt = function(req,res,next) {
    var password = lookup(req.body, 'password') || lookup(req.query, passwordField);

      /**
       * Add the password and the message to the request
       * so the callback can access them
       */
      if(password && req.body.message) {
        var userKey = userKeyGernerator.hash(password);
        var decryptedMessage = privateDataEncrypter.decrypt(userKey,req.body.message);

        return res.status(200).json({ message: decryptedMessage });
      }

      res.status(409).json({ message: 'the message could not be decrypted, no key found' });
  }

  /**
   * Extends the strategy authentication
   *
   * Authenticate request using the given strategy
   * doing whatever sereno is supposed to do inbetween
   *
   * @param {Object} req
   * @param {Object} options
   * @api protected
   */
  SerenoStrategy.prototype.authenticate = function(req, options) {
    /**
     * Override this.success (from passport/lib/middleware/authenticate)
     * so things get done after a successful authentication; and before
     * the response gets built.
     **/
    var success = this.success;
    this.success = function(user,info) {
      //TODO the password field may have a different name
          //var passwordField = options.passwordField || 'password';
      //TODO register the user key (encrypted with the sessionKey) along with the user session when needed
      return success(user,info);
    }

    return Strategy.prototype.authenticate.call(this,req,options);
  };

  return SerenoStrategy;
};

module.exports = {
  init: init
};
