'use strict'

var log = require('npmlog')
var fs = require('vigour-fs/lib/server')
var Promise = require('promise')

module.exports = exports = function createUninstallFile () {
  var self = this
  log.info('- creating the uninstall file for samsung TV-')
  return new Promise(function (resolve, reject) {
    var file = fs.createReadStream(self.templateSrc + '/uninstall.js').pipe(fs.createWriteStream(self.buildDir + '/Uninstall.js'))
    file.on('close', function () {
      resolve()
    })
  })
}
