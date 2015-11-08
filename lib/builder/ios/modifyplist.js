'use strict'

var log = require('npmlog')
var path = require('path')
var fs = require('vigour-fs/lib/server')
var plist = require('plist')

/**
    override default plist settings
 **/
module.exports = exports = function () {
  log.info('- configure project -')
  this.plistPath = path.join(this.buildDir, 'vigour-native/vigour-native/Info.plist')
  this.plistObject = plist.parse(fs.readFileSync(this.plistPath, 'utf8'))

  // var versionNumber = parseInt(plistObject["CFBundleVersion"])
  // plistObject["CFBundleVersion"] = '' + ++versionNumber

  if (this.organizationIdentifier) {
    this.plistObject.CFBundleIdentifier = this.organizationIdentifier
  }

  if (this.buildNumber) {
    this.plistObject.CFBundleVersion = this.buildNumber
  }

  if (this.productName) {
    this.plistObject.CFBundleName = this.productName
  }

  if (this.appUrlIdentifier && this.appUrlScheme) {
    this.plistObject.CFBundleURLTypes = []
    var urlScheme = {
      CFBundleTypeRole: 'Editor',
      CFBundleURLName: this.appUrlIdentifier,
      CFBundleURLSchemes: [this.appUrlScheme]
    }
    this.plistObject.CFBundleURLTypes.push(urlScheme)
  }

  if (this.NSAllowsArbitraryLoads) {
    this.plistObject.NSAppTransportSecurity = { 'NSAllowsArbitraryLoads': true }
  }

  if (this.appIndexPath) {
    this.plistObject.appIndexPath = this.appIndexPath
  } else {
    throw new Error('platforms.ios.appIndexPath should be provided!')
  }

  fs.writeFileSync(this.plistPath, plist.build(this.plistObject))
}
