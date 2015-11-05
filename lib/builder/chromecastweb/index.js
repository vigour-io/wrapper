'use strict'

var BaseBuilder = require('../base')

module.exports = exports = ChromeCastWebBuilder

ChromeCastWebBuilder.prototype = BaseBuilder.prototype

ChromeCastWebBuilder = function (opts) {
  this.platform = 'chromecastweb'
  BaseBuilder.call(this, opts)
  this.templateSrc = path.join(__dirname, '..', '..', '..', 'templates', 'chromecastweb')
  this.buildDir = path.join(this.root, 'build', 'chromecastweb')
  this.wwwDst = this.buildDir
  this.main = this.main || path.join(this.root, 'build.js')
}

ChromeCastWebBuilder.prototype.build = function () {
  log.info('---- Building ChromeCast Web ----')
  var tasks = [
    this.cleanup,
    this.copyIndexHtml
  ]
  return this.runTasks(tasks)
}

SamsungtvBuilder.prototype.cleanup = require('./cleanup')
SamsungtvBuilder.prototype.copyIndexHtml = require('./copyIndexHtml')
