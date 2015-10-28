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
  this.main = this.main || path.join(this.root, 'build.js')
  this.mainHtml = this.mainHtml || path.join(this.root, 'build.html')

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
    this.buildHtml,
    this.copyJsBuild,
    this.copyCssBuild,
    this.createUninstallFile,
    this.createVersionFile,
    this.checkIconsPath,
    this.zipAll,
    this.buildWidgetList,
    this.finish
  ]
  return this.runTasks(tasks)
}

SamsungtvBuilder.prototype.cleanup = require('./cleanup')
SamsungtvBuilder.prototype.createStructure = require('./createStructure')
SamsungtvBuilder.prototype.buildWidgetInfo = require('./buildWidgetInfo')
SamsungtvBuilder.prototype.buildConfigXml = require('./buildConfigXml')
SamsungtvBuilder.prototype.buildEclipseProject = require('./buildEclipseProject')
SamsungtvBuilder.prototype.buildHtml = require('./buildHtml')
SamsungtvBuilder.prototype.copyJsBuild = require('./copyJsBuild')
SamsungtvBuilder.prototype.copyCssBuild = require('./copyCssBuild')
SamsungtvBuilder.prototype.createUninstallFile = require('./createUninstallFile')
SamsungtvBuilder.prototype.createVersionFile = require('./createVersionFile')
SamsungtvBuilder.prototype.checkIconsPath = require('./checkIconsPath')
SamsungtvBuilder.prototype.zipAll = require('./zipAll')
SamsungtvBuilder.prototype.buildWidgetList = require('./buildWidgetList')
