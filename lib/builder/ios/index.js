'use strict'

var BaseBuilder = require('../base')
var log = require('npmlog')
var path = require('path')

module.exports = exports = IosBuilder

IosBuilder.prototype = BaseBuilder.prototype

function IosBuilder (opts) {
  this.platform = 'ios'
  BaseBuilder.call(this, opts)

  this.templateSrc = path.join(__dirname, '..', '..', '..', 'templates', 'ios')
  this.buildDir = path.join(this.root, 'build', 'ios')
  this.baseDir = path.join(this.buildDir, 'vigour-native')
  this.wwwDst = path.join(this.baseDir, 'www')

  this.validateOptions()
  // log.info('ios builder', this)
}

IosBuilder.prototype.validateOptions = function () {
  BaseBuilder.prototype.validateBaseOptions.call(this)
}

IosBuilder.prototype.build = function () {
  log.info('---- Building iOS ----')
  var tasks = [
    this.cleanup,
    this.prepare,
    this.installPods,
    this.configureTemplate,
    this.modifyPlist,
    this.nativeAssets,
    this.copyAssets,
    this.placeTitle,
    this.useLocation,
    this.buildPlugins,
    this.finish
  ]
  return this.runTasks(tasks)
}

IosBuilder.prototype.prepare = require('./prepare')
IosBuilder.prototype.installPods = require('./installpods')
IosBuilder.prototype.configureTemplate = require('./configuretemplate')
IosBuilder.prototype.modifyPlist = require('./modifyplist')
IosBuilder.prototype.nativeAssets = require('./nativeassets')

/**
      Helpers
 **/

// function replaceSpacesWithDashes (/*String*/ str) {
//   return str.replace(/\s+/g, '-').toLowerCase()
// }
