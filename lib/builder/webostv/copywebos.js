'use strict'

var log = require('npmlog')
var fs = require('vigour-fs/lib/server')
var Promise = require('promise')

module.exports = exports = function () {
  if (this.builds) {
    var self = this
    log.info('- creating webos.js for webos TV-')
    return new Promise(function (resolve, reject) {
      var file = fs.createReadStream(self.templateSrc + '/webos.js').pipe(fs.createWriteStream(self.buildDir + '/webos.js'))
      file.on('close', function () {
        resolve()
      })
    })
  } else {
    log.info('- skipping creating the version file for webosTV-')
  }
}
