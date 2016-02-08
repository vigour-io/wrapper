'use strict'

var log = require('npmlog')
var nativeUtil = require('../../util')

module.exports = exports = function () {
  if (this.builds) {
    log.info('- creating the widget list for samsung TV-')
    return nativeUtil.transform_template(this.templateSrc + '/widgetlist.xml', this.root + '/build/samsungtv/widgetlist.xml', this)
  } else {
    log.info('- skipping creating the widget list for samsung TV-')
  }
}
