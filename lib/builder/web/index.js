'use strict'

var BaseBuilder = require('../base')
var log = require('npmlog')
var path = require('path')

module.exports = exports = WebBuilder

WebBuilder.prototype = BaseBuilder.prototype

function WebBuilder (opts) {
  this.platform = 'web'
  BaseBuilder.call(this, opts)

  this.buildDir = path.join(this.root, 'build', 'web')
  this.wwwDst = this.buildDir

  this.validateOptions()
  // log.info('opts', JSON.stringify(this, null, 2))
}

WebBuilder.prototype.validateOptions = function () {
  BaseBuilder.prototype.validateBaseOptions.call(this)
  if (!this.appIndexPath) {
    var error = new Error('Invalid configuration')
    error.msg = 'Please provide `vigour.native.platforms.' + this.platform + '.appIndexPath`'
    throw error
  }
}

WebBuilder.prototype.build = function () {
  log.info('---- Building web ----')
  var tasks = [
    this.cleanup,
    this.copyAssets,
    // this.placeTitle,
    this.useLocation,
    this.buildPlugins,
    this.finish
  ]
  return this.runTasks(tasks)
}
