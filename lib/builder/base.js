'use strict'

var path = require('path')
var runTasks = require('./runtasks')
var copyAssets = require('./copyassets')
var addBridge = require('./addbridge')
var finish = require('./finish')
var cleanup = require('./cleanup')
var _merge = require('lodash/object/merge')

module.exports = exports = Builder

function Builder (opts) {
  if (!this.platform) {
    this.platform = 'base'
  }
  _merge(this, opts.vigour.native.platforms[this.platform])
  this.root = opts.vigour.native.root
  this.plugins = opts.vigour.native.plugins
  this.buildDir = path.join(this.root, 'build', this.platform)
  this.packer = opts.packer
  
}

Builder.prototype.validateBaseOptions = function () {}

Builder.prototype.runTasks = runTasks
Builder.prototype.cleanup = cleanup
Builder.prototype.copyAssets = copyAssets
Builder.prototype.addBridge = addBridge
Builder.prototype.finish = finish
