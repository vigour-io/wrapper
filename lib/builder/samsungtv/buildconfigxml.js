'use strict'

var log = require('npmlog')
var nativeUtil = require('../../util')

module.exports = exports = function () {
  if (this.builds) {
    log.info('- creating config.xml for samsung TV-')
    return nativeUtil.transform_template(this.templateSrc + '/config.xml', this.buildDir + '/config.xml', this)
  } else {
    log.info('- skipping creating config.xml for samsung TV-')
  }
}
