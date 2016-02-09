'use strict'

var log = require('npmlog')
var fs = require('vigour-fs-promised')

module.exports = exports = function () {
  if (this.builds) {
    log.info('- creating widget info for samsung TV-')
    return fs.cpAsync(this.templateSrc + '/widget.info', this.buildDir + '/widget.info', { mkdirp: true })
  } else {
    log.info('- skipping creating widget info for samsung TV-')
  }
}
