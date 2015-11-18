'use strict'

var BaseBuilder = require('../base')
var path = require('path')
var log = require('npmlog')

module.exports = exports = LgnetcasttvBuilder

LgnetcasttvBuilder.prototype = BaseBuilder.prototype

function LgnetcasttvBuilder (opts) {
  this.platform = 'lgnetcasttv'
  BaseBuilder.call(this, opts)
  this.templateSrc = path.join(__dirname, '..', '..', '..', 'templates', 'lgnetcasttv')
  this.buildDir = path.join(this.root, 'build', 'lgtv', 'lgnetcasttv')
  this.wwwDst = this.buildDir
  this.main = this.main || path.join(this.root, 'build.js')
  // log.info('opts', this)
}
LgnetcasttvBuilder.prototype.build = function () {
  log.info('---- Building LG netcast TV ----')
  var tasks = [
    this.cleanup,
    this.createStructure,
    this.finish
  ]
  return this.runTasks(tasks)
}

LgnetcasttvBuilder.prototype.cleanup = require('./cleanup')
LgnetcasttvBuilder.prototype.createStructure = require('./createstructure')
LgnetcasttvBuilder.prototype.buildWidgetList = require('./buildwidgetlist')
