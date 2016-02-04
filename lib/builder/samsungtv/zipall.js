'use strict'

var log = require('npmlog')
var nativeUtil = require('../../util')
var Promise = require('promise')

module.exports = exports = function () {
  if (this.builds) {
    var self = this
    log.info('- creating the Zip file for samsung TV-')
    return new Promise(function (resolve, reject) {
      nativeUtil.zip(self.buildDir, self.buildDir + '.zip', function (filesize) {
        self.size = filesize
        self.ip = nativeUtil.getIP(self)
        resolve()
      })
    })
  } else {
    log.info('- skipping creating the Zip file for samsung TV-')
  }
}
