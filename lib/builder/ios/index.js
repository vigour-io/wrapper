'use strict'

var BaseBuilder = require('../base')
var log = require('npmlog')
var path = require('path')

module.exports = exports = IosBuilder

IosBuilder.prototype = BaseBuilder.prototype

/**
 * @class
 * @augments IosBuilder
 * @classdesc The IosBuilder prototype constructs a new native iOS project based
 * on the iOS project template. The template is customized to include the
 * app-specific plugins as specified in the package.json file of the project.
 *
 * **Note:** use of this plugin requires the iOS build tools to be installed.
 *
 * @param {Object} opts options passed to the {@link BaseBuilder BaseBuilder}
 * constructor
 */
function IosBuilder (opts) {
  this.platform = 'ios'
  BaseBuilder.call(this, opts)

  this.templateSrc = path.join(__dirname, '..', '..', '..', 'templates', 'ios')
  this.buildDir = path.join(this.root, 'build', 'ios')
  this.wwwDst = path.join(this.buildDir, 'vigour-native', 'www')

  this.validateOptions()
  log.info('opts', this)
}

/**
 * Validates whether all requirements are met in order to run the builder (e.g.
 * if required configuration fields are in place) and runs the
 * {@link BaseBuilder#validateBaseOptions} method.
 */
IosBuilder.prototype.validateOptions = function () {
  BaseBuilder.prototype.validateBaseOptions.call(this)
}

/**
 * Executes all subtasks required to build the native project for the current
 * app. Build steps include;
 *
 * 1. {@link BaseBuilder#cleanup Cleaning up the build directory}
 * 2. {@link IosBuilder#prepare Installing the template}
 * 3. {@link IosBuilder#configureTemplate Adding plugins to the project}
 * 4. {@link IosBuilder#modifyPlist Update template plist to project settings}
 * 5. {@link IosBuilder#nativeAssets Copy assets for the native build, such as
 * app icons}
 * 6. {@link BaseBuilder#copyAssets Copy web assets to the project}
 * 7. {@link BaseBuilder#useLocation ???}
 * 8. {@link BaseBuilder#buildPlugins ???}
 * 9. {@link BaseBuilder#addBridge ???}
 * 10. {@link BaseBuilder#finish ???}
 */
IosBuilder.prototype.build = function () {
  log.info('---- Building iOS ----')
  var tasks = [
    this.cleanup,
    this.prepare,
    this.configureTemplate,
    this.modifyPlist,
    this.nativeAssets,
    this.copyAssets,
    this.useLocation,
    this.buildPlugins,
    this.addBridge,
    this.finish
  ]
  return this.runTasks(tasks)
}

IosBuilder.prototype.prepare = require('./prepare')
IosBuilder.prototype.configureTemplate = require('./configuretemplate')
IosBuilder.prototype.modifyPlist = require('./modifyplist')
IosBuilder.prototype.nativeAssets = require('./nativeassets')

/**
      Helpers
 **/

// function replaceSpacesWithDashes (/*String*/ str) {
//   return str.replace(/\s+/g, '-').toLowerCase()
// }
