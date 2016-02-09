'use strict'

var log = require('npmlog')
var nativeUtil = require('../../util')

module.exports = exports = function () {
  if (this.builds) {
    log.info('eclipse')
    return nativeUtil.transform_template(this.templateSrc + '/eclipse.project', this.buildDir + '/.project', this.xmlConfig)
  } else {
    log.info('skipping eclipse')
  }
}
