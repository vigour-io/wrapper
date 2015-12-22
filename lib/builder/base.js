'use strict'

var path = require('path')
var runTasks = require('./runtasks')
var copyAssets = require('./copyassets')
var useLocation = require('./uselocation')
var buildPlugins = require('./buildplugins')
var addBridge = require('./addbridge')
var finish = require('./finish')
var cleanup = require('./cleanup')
var _merge = require('lodash/object/merge')

module.exports = exports = BaseBuilder

/**
 * @class
 * @abstract
 * @classdesc The BaseBuilder prototype implements the shared functionality for
 * all builder types. It also acts as a shared interface allowing for
 * interchangeable builders to be used as more platforms become available.
 *
 * @param {Object} opts various options...
 */
function BaseBuilder (opts) {
  if (!this.platform) {
    this.platform = 'base'
  }
  _merge(this, opts.vigour.native.platforms[this.platform])
  this.root = opts.vigour.native.root
  this.plugins = opts.vigour.native.plugins
  this.buildDir = path.join(this.root, 'build', this.platform)
  this.packer = opts.packer
}

/**
 * Validates whether all requirements are met in order to run the builder (e.g.
 * if required configuration fields are in place).
 * @abstract
 */
BaseBuilder.prototype.validateBaseOptions = function () {}

BaseBuilder.prototype.runTasks = runTasks
BaseBuilder.prototype.cleanup = cleanup
BaseBuilder.prototype.copyAssets = copyAssets
BaseBuilder.prototype.useLocation = useLocation
BaseBuilder.prototype.buildPlugins = buildPlugins
BaseBuilder.prototype.addBridge = addBridge
BaseBuilder.prototype.finish = finish
