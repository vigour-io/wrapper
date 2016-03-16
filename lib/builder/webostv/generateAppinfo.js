'use strict'

var log = require('npmlog')
var nativeUtil = require('../../util')

module.exports = exports = function () {
  log.info('- creating the appinfo.json for webostv')
  return nativeUtil.transform_template(this.templateSrc + '/appinfo.json', this.buildDir + '/appinfo.json', this.appinfo)
}
