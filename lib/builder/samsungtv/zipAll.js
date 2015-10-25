var log = require('npmlog')
var nativeUtil = require('../../util')
var Promise = require('promise')

module.exports = exports = function () {
  var self = this
  log.info('- creating the Zip file for samsung TV-')
  return new Promise(function (resolve, reject) {
    nativeUtil.zip(self.buildDir, self.buildDir + '.zip', function (filesize) {
      self.xmlConfig.size = filesize
      self.xmlConfig.ip = nativeUtil.getIP(self)
      resolve()
    })
  })
}
