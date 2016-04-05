'use strict'

var BaseBuilder = require('../base')
var path = require('path')
var log = require('npmlog')

module.exports = exports = tizentvBuilder

tizentvBuilder.prototype = BaseBuilder.prototype

function tizentvBuilder (opts) {
  this.platform = 'tizentv'
  BaseBuilder.call(this, opts)
  this.templateSrc = path.join(__dirname, '..', '..', '..', 'templates', 'tizentv')
  this.buildDir = path.join(this.root, 'build', 'tizentv', 'tizen')
  this.wwwDst = this.buildDir
  this.main = this.main || path.join(this.root, 'build.js')

  this.validateOptions()
  log.info('opts', this)
}

tizentvBuilder.prototype.validateOptions = function () {
  BaseBuilder.prototype.validateBaseOptions.call(this)
}

tizentvBuilder.prototype.build = function () {
  log.info('---- Building tizen TV ----')
  var tasks = [
    this.cleanup,
    this.createStructure,
    this.copyAssets,
    // this.placeTitle,
    this.useLocation,
    this.buildPlugins,
    this.checkIconsPath,
    this.buildconfigxml,
    this.zipAll,
    this.finish
  ]
  return this.runTasks(tasks)
}

tizentvBuilder.prototype.cleanup = require('./cleanup')
tizentvBuilder.prototype.createStructure = require('./createstructure')
tizentvBuilder.prototype.checkIconsPath = require('./checkiconspath')
tizentvBuilder.prototype.buildconfigxml = require('./buildconfigxml')
tizentvBuilder.prototype.zipAll = require('./zipall')
