'use strict'

var log = require('npmlog')
var path = require('path')
var Promise = require('promise')
var fs = require('vigour-fs/lib/server')
var mkdirp = Promise.denodeify(fs.mkdirp)

module.exports = exports = function () {
  if (this.builds) {
    log.info('- creating folder structure for samsung TV-')

    return mkdirp(path.join(this.buildDir, 'icons'))
  } else {
    log.info('- skipping creating folder structure for samsung TV-')
  }
}
