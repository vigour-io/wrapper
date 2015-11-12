'use strict'

var log = require('npmlog')
var Promise = require('promise')
var fs = require('vigour-fs/lib/server')
var remove = Promise.denodeify(fs.remove)
var exec = require('child_process').exec

module.exports = exports = function () {
  log.info('- creating the IPK file for webostv-')
  var self = this
  return new Promise(function (resolve, reject) {
     exec("export PATH=/opt/webOS_TV_SDK/CLI/bin:$PATH && ares-package " + self.buildDir, {cwd:self.buildDir}, function (err, stderr, stdout) {
      if (err){
        log.error(err)
      } else {
        log.info(stderr)
        resolve()
      }
    })
  })
}

