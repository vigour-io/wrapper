'use strict'

var log = require('npmlog')
var nativeUtil = require('../../util')

module.exports = exports = function createIndexHtmlFile () {
  log.info('- creating chromecast castReceiver html -')
  return nativeUtil.transform_template(this.templateSrc + '/index.html', this.buildDir + '/castReceiver.html', this)
}
