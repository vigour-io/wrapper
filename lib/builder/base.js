'use strict'

var path = require('path')
var copyAssets = require('./copyassets')
var finish = require('./finish')
var runTasks = require('./runtasks')
var _merge = require('lodash/object/merge')

module.exports = exports = Builder

function Builder (opts) {
  if (!this.platform) {
    this.platform = 'base'
  }
  _merge(this, opts.native.platforms[this.platform])
  this.root = opts.native.root
  this.clean = opts.native.clean
  this.debug = opts.native.debug
  this.plugins = opts.native.plugins
  this.buildDir = path.join(this.root, 'build', this.platform)
  this.packer = opts.packer
}

Builder.prototype.validateBaseOptions = function () {

}

Builder.prototype.runTasks = runTasks

Builder.prototype.finish = finish

Builder.prototype.copyAssets = copyAssets
