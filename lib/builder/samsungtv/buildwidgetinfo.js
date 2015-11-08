'use strict'

var log = require('npmlog')
var Promise = require('promise')
var fs = require('vigour-fs/lib/server')

module.exports = exports = function () {
  var self = this
  log.info('- creating widget info for samsung TV-')
  return new Promise(function (resolve, reject) {
    var file = fs.createReadStream(self.templateSrc + '/widget.info').pipe(fs.createWriteStream(self.buildDir + '/widget.info'))
    file.on('close', function () {
      resolve()
    })
  })
}
