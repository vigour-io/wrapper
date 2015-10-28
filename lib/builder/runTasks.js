var log = require('npmlog')
var Promise = require('promise')

module.exports = exports = function (tasks) {
  var self = this
  return tasks.reduce(function (prev, curr) {
    return prev.then(function () {
      return curr.call(self)
    })
  }, Promise.resolve())
    .catch(function (reason) {
      try {
        log.error(self.platform, reason, JSON.stringify(reason), reason.stack)
      } catch (e) {
        log.error(self.platform + ' (unstringifiable)', reason, reason.stack)
      }
      throw reason
    })
}
