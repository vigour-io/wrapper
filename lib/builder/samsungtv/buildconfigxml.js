'use strict'

var log = require('npmlog')
var nativeUtil = require('../../util')
var Promise = require('promise')

module.exports = exports = function () {
  if (this.builds) {
    var self = this
    log.info('- creating config.xml for samsung TV-')
    return new Promise(function (resolve, reject) {
      nativeUtil.transform_template(self.templateSrc + '/config.xml', self.buildDir + '/config.xml', self)
      resolve()
    })
  } else {
    log.info('- skipping creating config.xml for samsung TV-')
  }
}
