'use strict'

var log = require('npmlog')
var nativeUtil = require('../../util')

module.exports = exports = function () {
  log.info('- creating config.xml for tizen TV-')
  return nativeUtil.transform_template(this.templateSrc + '/config.xml', this.buildDir + '/config.xml', this.config)
}
