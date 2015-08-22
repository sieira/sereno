/**
 * Why a strategy factory?
 * -----------------------
 *
 * I'm not quite sure, and this might be a mistake, but
 * the idea is to make Sereno be a wrapper for any other
 * given Strategy, so it can use whatever constant value
 * utilisable as key sereno can access to.
 *
 * For a local strategy, it is suppossed to catch up the user
 * password. And this will be the first thing to do before we go
 * to version 0.0.2 (19/08/2015)
 *
 **/
function init(Strategy) {
  var util = require('util'),
      lookup = require('./utils').lookup;

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
   * Authenticate request using the given strategy
   * do whatever sereno is supposed to do
   *
   * @param {Object} req
   * @param {Object} options
   * @api protected
   */
  SerenoStrategy.prototype.authenticate = function(req, options) {
    var username = lookup(req.body, this._usernameField) || lookup(req.query, this._usernameField);
    var password = lookup(req.body, this._passwordField) || lookup(req.query, this._passwordField);

    return Strategy.prototype.authenticate.call(this,req,options);
  };

  /**
   * Expose `SerenoStrategy`.
   */
  return SerenoStrategy;
};

module.exports = {
  init: init
};
