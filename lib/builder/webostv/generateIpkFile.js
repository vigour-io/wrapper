'use strict'

var log = require('npmlog')
var Promise = require('promise')
var exec = require('child_process').exec

module.exports = exports = function () {
  if (this.builds) {
    log.info('- creating the IPK file for webostv-')
    var self = this
    return new Promise(function (resolve, reject) {
      exec('export PATH=/opt/webOS_TV_SDK/CLI/bin:$PATH && ares-package ' + self.buildDir, {cwd: self.buildDir}, function (err, stderr, stdout) {
        if (err) {
          log.error(err)
        } else {
          log.info(stderr)
          resolve()
        }
      })
    })
  } else {
    log.info('- skipping creating the IPK file for webostv-')
  }
}
