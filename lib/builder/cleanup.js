'use strict'

var log = require('npmlog')
var fs = require('vigour-fs-promised')

module.exports = exports = function () {
  log.info('- clean build dir -')
  return fs.removeAsync(this.buildDir)
}
