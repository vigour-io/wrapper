'use strict'

var log = require('npmlog')
var fs = require('vigour-fs-promised')

module.exports = exports = function createIndexHtmlFile () {
  log.info('- creating chromecast castReceiver css -')
  return fs.cpAsync(this.templateSrc + '/vigourReceiver.css', this.buildDir + '/vigourReceiver.css', { mkdirp: true })
}
