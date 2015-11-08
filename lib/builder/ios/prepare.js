'use strict'

var log = require('npmlog')
var Promise = require('promise')
var fs = require('vigour-fs/lib/server')
var mkdirp = Promise.denodeify(fs.mkdirp)
var remove = Promise.denodeify(fs.remove)
var ncp = require('ncp')
var _ncp = Promise.denodeify(ncp)

module.exports = exports = function () {
  var self = this
  log.info('- prepare ios template -')
  return mkdirp(this.buildDir)
    .then(function () {
      return _ncp(self.templateSrc
          , self.buildDir
          , { clobber: true })
    })
    .then(function () { // clean out www
      return remove(self.wwwDst)
    })
    .then(function () {
      return mkdirp(self.wwwDst)
    })
}
