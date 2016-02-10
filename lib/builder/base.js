'use strict'

var path = require('path')
var locateAsset = require('./locateasset')
var runTasks = require('./runtasks')
var copyAssets = require('./copyassets')
var useLocation = require('./uselocation')
var buildPlugins = require('./buildplugins')
var addBridge = require('./addbridge')
var finish = require('./finish')
var cleanup = require('./cleanup')
var _merge = require('lodash/object/merge')

module.exports = exports = Builder

function Builder (opts) {
  this.opts = opts
  if (!this.platform) {
    this.platform = 'base'
  }
  _merge(this, opts.vigour.native.platforms[this.platform])
  this.root = opts.vigour.native.root
  this.plugins = opts.vigour.native.plugins
  this.buildDir = path.join(this.root, 'build', this.platform)
  this.externalAssetsDir = path.join(this.buildDir, 'externalAssets')
  this.builds = opts.vigour.native.builds
  this.packer = opts.packer
  this.html = this.appIndexPath
  if (this.location) {
    this.appIndexPath = 'index.html'
  }
}

Builder.prototype.validateBaseOptions = function () {}

Builder.prototype.locateAsset = locateAsset
Builder.prototype.runTasks = runTasks
Builder.prototype.cleanup = cleanup
Builder.prototype.copyAssets = copyAssets
Builder.prototype.useLocation = useLocation
Builder.prototype.buildPlugins = buildPlugins
Builder.prototype.addBridge = addBridge
Builder.prototype.finish = finish
