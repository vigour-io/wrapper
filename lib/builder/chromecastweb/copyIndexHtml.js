'use strict'

var log = require('npmlog')
var nativeUtil = require('../../util')
var Promise = require('promise')
var nativeUtil = require('../../util')

module.exports = exports = function () {
  var self = this
  log.info('- creating index.html for chromecast web-')
  return new Promise(function (resolve, reject) {
    nativeUtil.transform_template(self.templateSrc + '/index.html', self.buildDir + '/index.html', self.xmlConfig)
    resolve()
  })
}
