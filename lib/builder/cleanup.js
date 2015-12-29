'use strict'

var log = require('npmlog')
var fs = require('vigour-fs-promised')

/**
 * Cleans the build directory
 *
 * @memberof BaseBuilder
 * @instance
 * @function cleanup
 */
module.exports = exports = function () {
  log.info('- clean build dir -')
  return fs.removeAsync(this.buildDir)
}
