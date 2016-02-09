'use strict'

var log = require('npmlog')
var fs = require('vigour-fs-promised')

module.exports = exports = function createUninstallFile () {
  if (this.builds) {
    log.info('- creating the uninstall file for samsung TV-')
    return fs.cpAsync(this.templateSrc + '/uninstall.js', this.buildDir + '/Uninstall.js', { mkdirp: true })
  } else {
    log.info('- skipping creating the uninstall file for samsung TV-')
  }
}
