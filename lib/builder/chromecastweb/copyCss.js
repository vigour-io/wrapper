'use strict'

var log = require('npmlog')
var fs = require('vigour-fs/lib/server')
var Promise = require('promise')
var nativeUtil = require('../../util')

module.exports = exports = function createIndexHtmlFile () {
  var self = this
  log.info('- creating chromecast castReceiver css -')
  return new Promise(function (resolve, reject) {
    var file = fs.createReadStream(self.templateSrc + '/vigourReceiver.css').pipe(fs.createWriteStream(self.buildDir + '/vigourReceiver.css'))
    file.on('close', function () {
      resolve()
    })
  })
}

