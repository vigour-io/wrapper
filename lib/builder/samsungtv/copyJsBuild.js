'use strict'

var log = require('npmlog')
var fs = require('vigour-fs/lib/server')
var Promise = require('promise')
module.exports = exports = function () {
  var self = this
  log.info('- creating the js for samsung TV-')
  return new Promise(function (resolve, reject) {
    var file = fs.createReadStream(self.main).pipe(fs.createWriteStream(self.buildDir + '/build.js'))
    file.on('close', function () {
      resolve(self)
    })
  })
}
