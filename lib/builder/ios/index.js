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
  this.wwwDst = path.join(this.buildDir, 'vigour-native', 'www')

  this.validateOptions()
  // log.info('opts', this)
}

IosBuilder.prototype.validateOptions = function () {
  BaseBuilder.prototype.validateBaseOptions.call(this)
}

IosBuilder.prototype.build = function () {
  log.info('---- Building iOS ----')
  var tasks = [
    this.cleanup,
    this.prepare,
    this.configureTemplate,
    this.modifyPlist,
    this.nativeAssets,
    this.copyAssets,
    this.addBridge,
    this.finish
  ]
  return this.runTasks(tasks)
}

IosBuilder.prototype.cleanup = require('./cleanup')
IosBuilder.prototype.prepare = require('./prepare')
IosBuilder.prototype.configureTemplate = require('./configureTemplate')
IosBuilder.prototype.modifyPlist = require('./modifyPlist')
IosBuilder.prototype.nativeAssets = require('./nativeAssets')
IosBuilder.prototype.addBridge = require('./addBridge')

/**
      Helpers
 **/

// function replaceSpacesWithDashes (/*String*/ str) {
//   return str.replace(/\s+/g, '-').toLowerCase()
// }
