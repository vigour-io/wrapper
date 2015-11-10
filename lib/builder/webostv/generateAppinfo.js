'use strict'

var log = require('npmlog')
var Promise = require('promise')
var fs = require('vigour-fs/lib/server')
var remove = Promise.denodeify(fs.remove)
var exec = require('child_process').exec

module.exports = exports = function () {
  log.info('- creating the appinfo.json for webostv-')
  var self = this
  return new Promise(function (resolve, reject) {
     exec("export PATH=$WEBOS_CLI_TV:$PATH && ares-generate -t webappinfo" + opts.buildDir, {cwd:opts.buildRootDir}, function (err, stderr, stdout) {
      if (err){
        log.error(err)
      } else {
        log.info(stderr)
        resolve(opts)
      }
    })
  })
}
