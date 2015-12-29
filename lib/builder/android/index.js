'use strict'

var BaseBuilder = require('../base')
var path = require('path')
var log = require('npmlog')

module.exports = exports = AndroidBuilder

AndroidBuilder.prototype = BaseBuilder.prototype

/**
 * @class
 * @augments AndroidBuilder
 * @classdesc The AndroidBuilder prototype constructs a new native Android
 * project based on the Android project template. The template is customized to
 * include the app-specific plugins as specified in the package.json file of the
 * project.
 *
 * **Note:** use of this plugin requires the Android SDK to be installed and the
 * ANDROID_HOME environment variable to be set to the installation directory of
 * the Android SDK.
 *
 * @param {Object} opts options passed to the {@link BaseBuilder BaseBuilder}
 * constructor
 */
function AndroidBuilder (opts) {
  this.platform = 'android'
  BaseBuilder.call(this, opts)

  this.buildDir = path.join(this.root, 'build', 'android')
  this.moduleDir = path.join(this.buildDir, 'app')
  this.wwwDst = path.join(this.moduleDir, 'src', 'main', 'assets')

  if (this.builds) {
    this.sdkDir = process.env.ANDROID_HOME
    this.templateSrc = path.join(__dirname, '..', '..', '..', 'templates', 'android', 'app')
    this.pluginCoreSrc = path.join(__dirname, '..', '..', '..', 'templates', 'android', 'plugincore')
    this.srcDir = path.join(this.moduleDir, 'src', 'main')
    this.mainJavaFile = 'java/io/vigour/nativewrapper/MainActivity.java'
    this.outputDir = path.join(this.moduleDir, 'build', 'outputs', 'apk')
    this.apkNameBase = path.join(this.outputDir, 'app')

    this.aarDir = path.join(this.moduleDir, 'libs')
    this.adbPath = path.join(this.sdkDir, 'platform-tools', 'adb')
    this.keystoreKeyPassword = this.keystoreKeyPassword || this.keystorePassword
  }

  this.validateOptions()
  // log.info('opts', this)
}

/**
 * Validates whether all requirements are met in order to run the builder (e.g.
 * if required configuration fields are in place) and runs the
 * {@link BaseBuilder#validateBaseOptions} method.
 * 
 * @abstract
 * @throws {Error} `Missing environment variable` when the `ANDROID_HOME`
 * environment variable is not set.
 * @throws {Error} `Missing configuration` when the
 * `vigour.native.platforms.android.applicationId` field is not set in the
 * configuration file.
 * @throws {Error} `Invalid configuration` when the
 * `vigour.native.platforms.android.applicationId` field contains the invalid
 * character `-`.
 */
AndroidBuilder.prototype.validateOptions = function () {
  var error
  BaseBuilder.prototype.validateBaseOptions.call(this)
  if (this.builds && !process.env.ANDROID_HOME) {
    error = new Error('Missing environment variable')
    error.requireEnvVar = 'ANDROID_HOME'
    throw error
  }
  if (this.builds && !this.applicationId) {
    error = new Error('Missing configuration')
    error.requiredConfig = 'vigour.native.platforms.android.applicationId'
    throw error
  }
  if (this.builds && this.applicationId.indexOf('-') !== -1) {
    error = new Error('Invalid configuration')
    error.info = '`vigour.native.platforms.android.applicationId` cannot contain `-`'
    throw error
  }
}

/**
 * Executes all subtasks required to build the native project for the current
 * app. Build steps include;
 *
 * 1. {@link AndroidBuilder#installTemplate Installing the template}
 * 2. {@link BaseBuilder#copyAssets ???}
 * 3. {@link BaseBuilder#useLocation ???}
 * 4. {@link BaseBuilder#buildPlugins ???}
 * 5. {@link AndroidBuilder#customizeTemplate Customizing the template}
 * 6. {@link AndroidBuilder#installImages Install the correct image resources}
 * 7. {@link AndroidBuilder#installPlugins Install the needed vigour plugins}
 * 8. {@link AndroidBuilder#installStrings Install any app-specific texts}
 * 9. {@link AndroidBuilder#assemble Build a distributable app}
 * 10. {@link AndroidBuilder#installRun Install the app on a test device and start the app}
 * 11. {@link BaseBuilder#finish ???}
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
AndroidBuilder.prototype.installTemplate = require('./installtemplate')
AndroidBuilder.prototype.customizeTemplate = require('./customizetemplate')
AndroidBuilder.prototype.installImages = require('./installimages')
AndroidBuilder.prototype.installPlugins = require('./installplugins')
AndroidBuilder.prototype.installStrings = require('./installStrings')
AndroidBuilder.prototype.assemble = require('./assemble')
AndroidBuilder.prototype.installRun = require('./installrun')
