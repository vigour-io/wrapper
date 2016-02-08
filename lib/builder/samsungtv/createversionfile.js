'use strict'

var log = require('npmlog')
var fs = require('vigour-fs-promised')

module.exports = exports = function () {
  if (this.builds) {
    log.info('- creating the version file for samsung TV-')
    return fs.cpAsync(this.templateSrc + '/version.js', this.buildDir + '/version.js')
  } else {
    log.info('- skipping creating the version file for samsung TV-')
  }
}
