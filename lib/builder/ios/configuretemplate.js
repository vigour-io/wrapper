'use strict'

var log = require('npmlog')
var path = require('path')
var xcode = require('xcode')
var fs = require('vigour-fs/lib/server')
var Promise = require('promise')

/**
 * Customizes the iOS project template by inserting custom source files and
 * plugin frameworks.
 *
 * @memberof IosBuilder
 * @instance
 * @function configureTemplate
 */
module.exports = exports = function () {
  if (this.builds) {
    var self = this
    log.info('- configure template -')
    this.projectPath = path.join(this.buildDir, 'vigour-native/vigour-native.xcodeproj/project.pbxproj')
    var templateProj = xcode.project(this.projectPath)
    return new Promise(function (resolve, reject) {
      templateProj.parse(function (err) {
        if (err) {
          reject(err)
        } else {
          // templateProj.addHeaderFile('foo.h');
          // templateProj.addSourceFile('foo.m');
          // templateProj.addFramework('FooKit.framework');

          // templateProj.addResourceFile()

          // if(opts.productName) {
          //   templateProj.updateProductName(replaceSpacesWithDashes(opts.productName))
          // }

          // add framework stuff.. plugins etc.
          fs.writeFileSync(self.projectPath, templateProj.writeSync())
          resolve()
        }
      })
    })
  } else {
    log.info('- skipping configure template -')
  }
}
