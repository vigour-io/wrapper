'use strict'

var log = require('npmlog')
var fs = require('vigour-fs-promised')

module.exports = exports = function createIndexHtmlFile () {
  log.info('- creating chromecast castReceiver js -')
  return fs.cpAsync(this.templateSrc + '/vigourReceiver.js', this.buildDir + '/vigourReceiver.js', { mkdirp: true })
}
