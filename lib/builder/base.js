var path = require('path')
var copyAssets = require('./copyAssets')
var finish = require('./finish')
var runTasks = require('./runTasks')
var _merge = require('lodash/object/merge')

module.exports = exports = Builder

function Builder (opts) {
  if (!this.platform) {
    this.platform = 'base'
  }
  _merge(this, opts.vigour.native.platforms[this.platform])
  this.root = opts.vigour.native.root
  this.clean = opts.vigour.native.clean
  this.debug = opts.vigour.native.debug
  this.plugins = opts.vigour.native.plugins
  this.buildDir = path.join(this.root, 'build', this.platform)
  this.packer = opts.vigour.packer
}

Builder.prototype.validateBaseOptions = function () {

}

Builder.prototype.runTasks = runTasks

Builder.prototype.finish = finish

Builder.prototype.copyAssets = copyAssets
