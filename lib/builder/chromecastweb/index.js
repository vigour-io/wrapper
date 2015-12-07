'use strict'

var BaseBuilder = require('../base')
var path = require('path')
var log = require('npmlog')

module.exports = exports = ChromeCastWebBuilder

ChromeCastWebBuilder.prototype = BaseBuilder.prototype

function ChromeCastWebBuilder (opts) {
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
    this.createStructure,
    this.copyIndexHtml,
    this.copyJs,
    this.copyCss,
    this.useLocation,
    this.buildPlugins,
    this.finish
  ]
  return this.runTasks(tasks)
}

ChromeCastWebBuilder.prototype.cleanup = require('./cleanup')
ChromeCastWebBuilder.prototype.createStructure = require('./createStructure')
ChromeCastWebBuilder.prototype.copyIndexHtml = require('./copyIndexHtml')
ChromeCastWebBuilder.prototype.copyJs = require('./copyjs')
ChromeCastWebBuilder.prototype.copyCss = require('./copycss')
