'use strict'

var log = require('npmlog')
var fs = require('vigour-fs/lib/server')
var Promise = require('promise')
var nativeUtil = require('../../util')

module.exports = exports = function createIndexHtmlFile () {
  var self = this
  log.info('- creating chromecast castReceiver html -')
  return new Promise(function (resolve, reject) {
    var file = fs.createReadStream(self.templateSrc + '/index.html').pipe(fs.createWriteStream(self.buildDir + '/castReceiver.html'))
    file.on('close', function () {
      nativeUtil.transform_template(self.templateSrc + '/index.html', self.buildDir + '/castReceiver.html', self)
      resolve()
    })
  })
}

