'use strict'

var log = require('npmlog')
var fs = require('vigour-fs/lib/server')
var Promise = require('promise')

module.exports = exports = function () {
  var self = this
  log.info('- creating the version file for samsung TV-')
  return new Promise(function (resolve, reject) {
    var file = fs.createReadStream(self.templateSrc + '/version.js').pipe(fs.createWriteStream(self.buildDir + '/version.js'))
    file.on('close', function () {
      resolve()
    })
  })
}
