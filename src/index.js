var Promise = require('promise')
  , android = require('./android')

module.exports = exports = {}

exports.build = function (options, cb) {
  var startTime = Date.now()
    , pending = []
  if (options.platforms && options.platforms.android) {
    pending.push(android.build(options))
  }
  Promise.all(pending)
    .then(function () {
      var endTime = Date.now()
      cb(null, {
        time: endTime - startTime
      })
    })
    .catch(cb)
}
