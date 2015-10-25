var path = require('path')
var log = require('npmlog')
var copyAssets = require('./copyAssets')
var finish = require('./finish')
var Promise = require('promise')
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

Builder.prototype.runTasks = function (tasks) {
  var self = this
  return tasks.reduce(function (prev, curr) {
    return prev.then(function () {
      return curr.call(self)
    })
  }, Promise.resolve())
    .catch(function (reason) {
      try {
        log.error(self.platform, reason, JSON.stringify(reason), reason.stack)
      } catch (e) {
        log.error(self.platform + ' (unstringifiable)', reason, reason.stack)
      }
      throw reason
    })
}

Builder.prototype.finish = finish

Builder.prototype.copyAssets = copyAssets
