'use strict'

var log = require('npmlog')
var fs = require('vigour-fs/lib/server')
var Promise = require('promise')

module.exports = exports = function () {
  var self = this
  log.info('- creating the css for samsung TV-')
  return new Promise(function (resolve, reject) {
    var file = fs.createReadStream(self.root + '/build.css').pipe(fs.createWriteStream(self.buildDir + '/build.css'))
    file.on('close', function () {
      resolve()
    })
  })
}
