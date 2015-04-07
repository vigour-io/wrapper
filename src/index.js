var Promise = require('promise')
  , android = require('./android')

module.exports = exports = {}

exports.build = function (options, cb) {
  var pending = []
  if (options.platforms && options.platforms.android) {
    pending.push(android.build(options))
  }
  Promise.all(pending)
    .then(function () {
      cb(null, {})
    })
    .catch(cb)
}
