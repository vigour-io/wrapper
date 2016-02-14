'use strict'

var path = require('path')
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

Builder.prototype.editFile = require('./editfile')
Builder.prototype.placeTitle = require('./placetitle')
Builder.prototype.locateAsset = require('./locateasset')
Builder.prototype.runTasks = require('./runtasks')
Builder.prototype.cleanup = require('./cleanup')
Builder.prototype.copyAssets = require('./copyassets')
Builder.prototype.useLocation = require('./uselocation')
Builder.prototype.buildPlugins = require('./buildplugins')
Builder.prototype.addBridge = require('./addbridge')
Builder.prototype.finish = require('./finish')
