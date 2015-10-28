var log = require('npmlog')
var nativeUtil = require('../../util')
var Promise = require('promise')

module.exports = exports = function () {
  var self = this
  log.info('eclipse')
  return new Promise(function (resolve, reject) {
    nativeUtil.transform_template(self.templateSrc + '/eclipse.project', self.buildDir + '/.project', self.xmlConfig)
    resolve()
  })
}
