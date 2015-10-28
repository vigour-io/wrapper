'use strict'

var BaseBuilder = require('../base')
var path = require('path')
var log = require('npmlog')

module.exports = exports = AndroidBuilder

AndroidBuilder.prototype = BaseBuilder.prototype

function AndroidBuilder (opts) {
  this.platform = 'android'
  BaseBuilder.call(this, opts)
  this.sdkDir = process.env.ANDROID_HOME
  this.templateSrc = path.join(__dirname, '..', '..', '..', 'templates', 'android', 'app')
  this.pluginCoreSrc = path.join(__dirname, '..', '..', '..', 'templates', 'android', 'plugincore')
  this.buildDir = path.join(this.root, 'build', 'android')
  this.moduleDir = path.join(this.buildDir, 'app')
  this.srcDir = path.join(this.moduleDir, 'src', 'main')
  this.mainJavaFile = 'java/io/vigour/nativewrapper/MainActivity.java'
  this.outputDir = path.join(this.moduleDir, 'build', 'outputs', 'apk')
  this.apkNameBase = path.join(this.outputDir, 'app')
  this.wwwDst = path.join(this.moduleDir, 'src', 'main', 'assets')
  this.aarDir = path.join(this.moduleDir, 'libs')
  this.adbPath = path.join(this.sdkDir, 'platform-tools', 'adb')
  this.keystoreKeyPassword = this.keystoreKeyPassword || this.keystorePassword

  this.validateOptions()
// log.info('opts', this)
}

AndroidBuilder.prototype.validateOptions = function () {
  var error
  BaseBuilder.prototype.validateBaseOptions.call(this)
  if (!process.env.ANDROID_HOME) {
    error = new Error('Missing environment variable')
    error.requireEnvVar = 'ANDROID_HOME'
    throw error
  }
  if (!this.applicationId) {
    error = new Error('Missing configuration')
    error.requiredConfig = 'vigour.native.platforms.android.applicationId'
    throw error
  }
  if (this.applicationId.indexOf('-') !== -1) {
    error = new Error('Invalid configuration')
    error.info = '`vigour.native.platforms.android.applicationId` cannot contain `-`'
    throw error
  }
}

AndroidBuilder.prototype.build = function () {
  log.info('---- Building Android ----')
  var tasks = [
    this.installTemplate,
    this.copyAssets,
    this.customizeTemplate,
    this.installImages,
    this.installPlugins,
    this.assemble,
    this.run,
    this.finish
  ]
  return this.runTasks(tasks)
}

AndroidBuilder.prototype.buildCore = require('./buildCore')
AndroidBuilder.prototype.installTemplate = require('./installTemplate')
AndroidBuilder.prototype.customizeTemplate = require('./customizeTemplate')
AndroidBuilder.prototype.installImages = require('./installImages')
AndroidBuilder.prototype.installPlugins = require('./installPlugins')
AndroidBuilder.prototype.assemble = require('./assemble')
AndroidBuilder.prototype.run = require('./run')
