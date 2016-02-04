'use strict'

var log = require('npmlog')
var nativeUtil = require('../../util')
var Promise = require('promise')

module.exports = exports = function () {
  if (this.builds) {
    var self = this
    log.info('- creating the widget list for samsung TV-')
    return new Promise(function (resolve, reject) {
      nativeUtil.transform_template(self.templateSrc + '/widgetlist.xml', self.root + '/build/samsungtv/widgetlist.xml', self)
      resolve()
    })
  } else {
    log.info('- skipping creating the widget list for samsung TV-')
  }
}
