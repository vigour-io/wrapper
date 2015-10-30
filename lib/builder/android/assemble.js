'use strict'

var log = require('npmlog')
var path = require('path')
var Promise = require('promise')
var fs = require('vigour-fs/lib/server')
var readFile = Promise.denodeify(fs.readFile)

module.exports = exports = function () {
  var self = this
  log.info('- start assemble -')
  var exe = this.exe || require('../../exe')
  var buildType = this.debug ? 'assembleDebug' : 'assembleRelease'
  var command = './gradlew ' + buildType +
    ' -PverCode=' + this.versionCode +
    ' -PverName=' + this.version +
    ' -PandroidAppId=' + this.applicationId

  var callOpts = { scramble: [] }

  if (!this.debug && this.keystorePassword) {
    command += ' -PRELEASE_STORE_PASSWORD=' + this.keystorePassword
    callOpts.scramble.push(this.keystorePassword)
  }
  if (!this.debug && this.keystoreAlias) {
    command += ' -PRELEASE_KEY_ALIAS=' + this.keystoreAlias
  }
  if (!this.debug && this.keystoreKeyPassword) {
    command += ' -PRELEASE_KEY_PASSWORD=' + this.keystoreKeyPassword
    callOpts.scramble.push(this.keystoreKeyPassword)
  }

  return Promise.resolve()
    .then(function () {
      if (self.keystoreFile) {
        var srcPath = path.join(self.root, self.keystoreFile)
        var dstPath = path.join(self.moduleDir, 'release.keystore')
        log.info('copy keystore file from: ' + srcPath + ' to ' + dstPath)
        return Promise.resolve(srcPath)
          .then(readFile)
          .then(function (file) {
            return fs.writeFile(dstPath, file)
          })
      } else {
        return Promise.resolve()
      }
    })
    .then(function () {
      return exe(command, self.buildDir, callOpts)
    })
}
