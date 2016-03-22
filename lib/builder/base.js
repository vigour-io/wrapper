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
  /* externalAssets: phase it out */
  // TODO: remove externalAssets, builds, packer, html
  this.externalAssetsDir = path.join(this.buildDir, 'externalAssets')
  this.builds = opts.vigour.native.builds
  this.packer = opts.packer
  this.html = this.appIndexPath
  if (this.location) {
    this.appIndexPath = 'index.html'
  }
}

Builder.prototype.validateBaseOptions = function () {}
// TODO: see if editfile is still used
Builder.prototype.editFile = require('./editfile')
// Builder.prototype.placeTitle = require('./placetitle')
/* locateasset: see if assets are in assets or localAssets or both */
Builder.prototype.locateAsset = require('./locateasset')
Builder.prototype.runTasks = require('./runtasks')
/* cleanup: wipe old build stuff before running new wrap */
Builder.prototype.cleanup = require('./cleanup')
/* copyAssets: copy files to places */
Builder.prototype.copyAssets = require('./copyassets')
/* useLocation: create relocator index.html */
// TODO: have native wrapped apps load location directly vs redirecting in index.html
Builder.prototype.useLocation = require('./uselocation')
/* buildPlugins: run plugin (dependency) specific buildPlugin.js scripts
  which modify the wrapping process.
  e.g. facebook puts facebook.appId from project package in platformWrapper.strings
*/
Builder.prototype.buildPlugins = require('./buildplugins')
/* addBridge: begone! */
Builder.prototype.addBridge = require('./addbridge')
/* finish: nice loggin style! */
Builder.prototype.finish = require('./finish')
