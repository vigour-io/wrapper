'use strict'

var BaseBuilder = require('../base')
var path = require('path')
var log = require('npmlog')

module.exports = exports = AndroidBuilder

AndroidBuilder.prototype = BaseBuilder.prototype

/**
 * @class
 * @extends BaseBuilder
 * @classdesc <p>The AndroidBuilder prototype constructs a new native Android
 * project based on the Android project template. The template is customized to
 * include the app-specific plugins as specified in the package.json file of the
 * project.</p>
 *
 * <p><strong>Note:</strong> use of this plugin requires the Android SDK to be installed and the
 * ANDROID_HOME environment variable to be set to the installation directory of
 * the Android SDK.</p>
 *
 * @param {Object} opts Unknown...
 */
function AndroidBuilder (opts) {
  this.platform = 'android'
  BaseBuilder.call(this, opts)
  this.sdkDir = process.env.ANDROID_HOME
  if (!this.sdkDir) {
    throw new Error('android ANDROID_HOME env var not set')
  }
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

/** @inheritdocs */
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

/**
 * <p>Executes all subtasks required to build the native project for the current
 * app. Build steps include;</p>
 * <ol>
 * <li>{@link AndroidBuilder#installTemplate Installing the template}</li>
 * <li>{@link BaseBuilder#copyAssets ???}</li>
 * <li>{@link BaseBuilder#useLocation ???}</li>
 * <li>{@link BaseBuilder#buildPlugins ???}</li>
 * <li>{@link AndroidBuilder#customizeTemplate Customizing the template}</li>
 * <li>{@link AndroidBuilder#installImages Install the correct image resources}</li>
 * <li>{@link AndroidBuilder#installPlugins Install the needed vigour plugins}</li>
 * <li>{@link AndroidBuilder#installStrings Install any app-specific texts}</li>
 * <li>{@link AndroidBuilder#assemble Build a distributable app}</li>
 * <li>{@link AndroidBuilder#installRun Install the app on a test device and start the app}</li>
 * <li>{@link BaseBuilder#finish ???}</li>
 * </ol>
 */
AndroidBuilder.prototype.build = function () {
  log.info('---- Building Android ----')
  var tasks = [
    this.installTemplate,
    this.copyAssets,
    this.useLocation,
    this.buildPlugins,
    this.customizeTemplate,
    this.installImages,
    this.installPlugins,
    this.installStrings,
    this.assemble,
    this.installRun,
    this.finish
  ]
  return this.runTasks(tasks)
}

AndroidBuilder.prototype.buildCore = require('./buildcore')

/**
 * Installs the template Android project from the /templates/android directory.
 */
AndroidBuilder.prototype.installTemplate = require('./installtemplate')

/**
 * Customizes the Android project to use the correct application ID, product
 * name and splash screen duration as configured in the project's package.json
 * file.
 */
AndroidBuilder.prototype.customizeTemplate = require('./customizetemplate')

/**
 * Installs the app-specific images, like the splash screen image and app icon.
 */
AndroidBuilder.prototype.installImages = require('./installimages')

/**
 * Installs the app-specific vigour plugins.
 */
AndroidBuilder.prototype.installPlugins = require('./installplugins')

/**
 * Installs the app-specific translations by appending them to the default
 * strings.xml file.
 */
AndroidBuilder.prototype.installStrings = require('./installStrings')

/**
 * Assembles the native Android project into a distributable .apk file.
 */
AndroidBuilder.prototype.assemble = require('./assemble')

/**
 * Install the app on a test device and start the app.
 */
AndroidBuilder.prototype.installRun = require('./installrun')
