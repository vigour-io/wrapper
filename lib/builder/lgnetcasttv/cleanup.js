'use strict'

var log = require('npmlog')
var Promise = require('promise')
var fs = require('vigour-fs/lib/server')
var remove = Promise.denodeify(fs.remove)

module.exports = exports = function () {
  log.info('- clean net cast TV build dir -')
  return remove(this.buildDir)
}
