'use strict'

var log = require('npmlog')
var spawn = require('vigour-spawn')

module.exports = exports = function () {
  if (this.builds) {
    log.info('- install pods -')
    return spawn('pod install', { cwd: this.baseDir })
  } else {
    log.info('- skipping install pods -')
  }
}
