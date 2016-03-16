'use strict'

var log = require('npmlog')
var path = require('path')
var fs = require('vigour-fs-promised')

module.exports = exports = function () {
  log.info('- creating folder structure for webostv-')
  return fs.mkdirp(path.join(this.buildDir))
}
