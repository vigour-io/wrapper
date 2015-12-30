'use strict'

var log = require('npmlog')
var nativeUtil = require('../../util')
var Promise = require('promise')

module.exports = exports = function () {
  var self = this
  log.info('- creating config.xml for tizen TV-')
  return new Promise(function (resolve, reject) {
    nativeUtil.transform_template(self.templateSrc + '/config.xml', self.buildDir + '/config.xml', self.config)
    resolve()
  })
}
