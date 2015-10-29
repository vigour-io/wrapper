'use strict'

var log = require('npmlog')
var path = require('path')
var xcode = require('xcode')
var fs = require('vigour-fs/lib/server')
var Promise = require('promise')

/**
  * configure the template xcode project
  */
module.exports = exports = function () {
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
}
