'use strict'

var log = require('npmlog')
var Promise = require('promise')
var fs = require('vigour-fs/lib/server')
var remove = Promise.denodeify(fs.remove)
<<<<<<< HEAD
var exec = require('child_process').exec

module.exports = exports = function () {
  log.info('- creating the appinfo.json for webostv-')
  var self = this
  return new Promise(function (resolve, reject) {
     exec("export PATH=/opt/webOS_TV_SDK/CLI/bin:$PATH && ares-generate -t webappinfo " + self.buildDir, {cwd:self.buildRootDir}, function (err, stderr, stdout) {
      if (err){
        log.error(err)
      } else {
        log.info(stderr)
        resolve()
=======

module.exports = exports = function () {
  log.info('- creating the appinfo.json for webostv-')
  return new Promise(function (resolve, reject) {
    fs.writeFile(opts.buildDir + "/appinfo.json", JSON.stringify(opts.appinfo, null, 4), function(err) {
      if(err) {
        console.log(err)
      } else {
        resolve(opts)
>>>>>>> 4caa46ee81652f6fc3c150c904db5fe7ae55bf5b
      }
    })
  })
}
<<<<<<< HEAD

=======
>>>>>>> 4caa46ee81652f6fc3c150c904db5fe7ae55bf5b
