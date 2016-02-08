'use strict'

var BaseBuilder = require('../base')
var path = require('path')
var log = require('npmlog')

module.exports = exports = SamsungtvBuilder

SamsungtvBuilder.prototype = BaseBuilder.prototype

function SamsungtvBuilder (opts) {
  this.platform = 'samsungtv'
  BaseBuilder.call(this, opts)
  this.templateSrc = path.join(__dirname, '..', '..', '..', 'templates', 'samsungtv')
  this.buildDir = path.join(this.root, 'build', 'samsungtv', 'samsung')
  this.wwwDst = this.buildDir
  this.main = this.main || path.join(this.root, 'build.js')

  this.validateOptions()
  // log.info('opts', this)
}

SamsungtvBuilder.prototype.validateOptions = function () {
  BaseBuilder.prototype.validateBaseOptions.call(this)
}

SamsungtvBuilder.prototype.build = function () {
  log.info('---- Building Samsung TV ----')
  var tasks = [
    this.cleanup,
    this.createStructure,
    this.buildWidgetInfo,
    this.buildConfigXml,
    this.buildEclipseProject,
    this.copyAssets,
    this.useLocation,
    this.buildPlugins,
    this.modifyHtml,
    this.createUninstallFile,
    this.createVersionFile,
    this.checkIconsPath,
    this.zipAll,
    this.buildWidgetList,
    this.finish
  ]
  return this.runTasks(tasks)
}

SamsungtvBuilder.prototype.createStructure = require('./createstructure')
SamsungtvBuilder.prototype.buildWidgetInfo = require('./buildwidgetinfo')
SamsungtvBuilder.prototype.buildConfigXml = require('./buildconfigxml')
SamsungtvBuilder.prototype.buildEclipseProject = require('./buildeclipseproject')
SamsungtvBuilder.prototype.modifyHtml = require('./modifyhtml')
SamsungtvBuilder.prototype.createUninstallFile = require('./createuninstallfile')
SamsungtvBuilder.prototype.createVersionFile = require('./createversionfile')
SamsungtvBuilder.prototype.checkIconsPath = require('./checkiconspath')
SamsungtvBuilder.prototype.zipAll = require('./zipall')
SamsungtvBuilder.prototype.buildWidgetList = require('./buildwidgetlist')
