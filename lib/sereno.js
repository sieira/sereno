/**
 * Module dependencies.
 *
var pause = require('pause')
  , util = require('util')
  , Strategy = require('passport-strategy');
*/
var util = require('util'),
    Strategy = require('passport-strategy').Strategy;

/**
 * `SerenoStrategy` constructor.
 *
 * @api public
 */
function SerenoStrategy(strategy) {
  if (!strategy) { throw new TypeError('SerenoStrategy requires to be given a strategy'); }

  Strategy.call(this);
  this.strategy = strategy;

  //  this.strategy.fail = function(msg) { console.log('something failed:' + msg)};
  this.name = 'sereno';
}

/**
 * Inherit from `Strategy`.
 */
util.inherits(SerenoStrategy, Strategy);

/**
 * Authenticate request based on the current session state.
 *
 *
 * This strategy delegates this procedure to the internal one.
 *
 * @param {Object} req
 * @param {Object} options
 * @api protected
 */
SerenoStrategy.prototype.authenticate = function(req, options) {
    var that = this.strategy;
    that.authenticate.call(that,req,options);
};


/**
 * Expose `SerenoStrategy`.
 */
module.exports = SerenoStrategy;
