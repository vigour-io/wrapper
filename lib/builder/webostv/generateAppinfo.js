'use strict'

var log = require('npmlog')
var Promise = require('promise')
var fs = require('vigour-fs/lib/server')
var remove = Promise.denodeify(fs.remove)
var exec = require('child_process').exec
var nativeUtil = require('../../util')

module.exports = exports = function () {
  log.info('- creating the appinfo.json for webostv-')
  var self = this
  return new Promise(function (resolve, reject) {
    nativeUtil.transform_template(self.templateSrc + '/appinfo.json', self.buildDir + '/appinfo.json', self.appinfo)
    resolve()
  })
}
