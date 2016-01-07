'use strict'

var log = require('npmlog')
var nativeUtil = require('../../util')
var Promise = require('promise')

module.exports = exports = function () {
  var self = this
  log.info('- creating the wgt file for tizen TV-')
  return new Promise(function (resolve, reject) {
    nativeUtil.zip(self.buildDir, self.buildDir + '.wgt', function (filesize) {
      resolve()
    })
  })
}
