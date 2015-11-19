'use strict'

var log = require('npmlog')
var fs = require('vigour-fs/lib/server')
var Promise = require('promise')
var nativeUtil = require('../../util')

module.exports = exports = function createIndexHtmlFile () {
  var self = this
  log.info('- creating chromecast castReceiver js -')
  return new Promise(function (resolve, reject) {
    var file = fs.createReadStream(self.templateSrc + '/vigourReceiver.js').pipe(fs.createWriteStream(self.buildDir + '/vigourReceiver.js'))
    file.on('close', function () {
      resolve()
    })
  })
}

