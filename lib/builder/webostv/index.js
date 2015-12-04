'use strict'

var BaseBuilder = require('../base')
var path = require('path')
var log = require('npmlog')

module.exports = exports = Webostv

Webostv.prototype = BaseBuilder.prototype

function Webostv (opts) {
  this.platform = 'webostv'
  BaseBuilder.call(this, opts)
  this.templateSrc = path.join(__dirname, '..', '..', '..', 'templates', 'webostv')
  this.buildDir = path.join(this.root, 'build', 'lgtv', 'webos')
  this.wwwDst = this.buildDir
  this.main = this.main || path.join(this.root, 'build.js')

  this.validateOptions()
  // log.info('opts', this)
}

Webostv.prototype.validateOptions = function () {
  BaseBuilder.prototype.validateBaseOptions.call(this)
}

Webostv.prototype.build = function () {
  log.info('---- Building webos TV ----')
  var tasks = [
    this.cleanup,
    this.createStructure,
    this.generateAppinfo,
    this.copyAssets,
    this.buildPlugins,
    this.generateIpkFile,
    this.finish
  ]
  return this.runTasks(tasks)
}

Webostv.prototype.cleanup = require('./cleanup')
Webostv.prototype.createStructure = require('./createstructure')
Webostv.prototype.generateAppinfo = require('./generateAppinfo')
Webostv.prototype.generateIpkFile = require('./generateIpkFile')
