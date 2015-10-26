var log = require('npmlog')
var Promise = require('promise')
var exe = require('../../exe')

module.exports = exports = function () {
  var self = this
  function installApk () {
    log.info('start install')
    var apkName = self.apkNameBase + (self.debug ? '-debug.apk' : '-release.apk')
    return exe(self.adbPath + ' install -r ' + apkName, self.outputDir)
  }

  function runOnDevice () {
    log.info('start run')
    return exe(self.adbPath + ' shell monkey -p ' + self.applicationId + ' 1', self.root)
  }
  return Promise.resolve()
    .then(installApk)
    .then(runOnDevice)
}
