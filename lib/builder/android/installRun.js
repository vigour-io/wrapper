'use strict'

var Promise = require('promise')

module.exports = exports = function () {
  var self = this
  var exe = this.exe || require('../../exe')
  var log = this.log || require('npmlog')

  function installApk () {
    log.info('start install')
    var apkName = self.apkNameBase + (self.debug ? '-debug.apk' : '-release.apk')
    return exe(self.adbPath + ' install -r ' + apkName, self.outputDir)
  }

  function runOnDevice () {
    log.info('start run')
    return exe(self.adbPath + ' shell monkey -p ' + self.applicationId + ' 1', self.root)
  }

  log.info('run=', this.run)
  if (!this.run) {
    log.info('skipping run')
    return Promise.resolve()
  }
  log.info('doing run')
  return Promise.resolve()
    .then(installApk)
    .then(runOnDevice)
}
