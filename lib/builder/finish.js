'use strict'

var log = require('npmlog')

module.exports = exports = function () {
  log.info('---- End of ' + this.platform + ' build ----')
  return true
}
