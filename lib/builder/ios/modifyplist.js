'use strict'

var log = require('npmlog')
var path = require('path')
var fs = require('vigour-fs/lib/server')
var plist = require('plist')

/**
    override default plist settings
 **/
module.exports = exports = function () {
  if (this.builds) {
    log.info('- configure project -')
    this.plistPath = path.join(this.buildDir, 'vigour-native/vigour-native/Info.plist')
    this.plistObject = plist.parse(fs.readFileSync(this.plistPath, 'utf8'))

    this.plistObject.CFBundleURLTypes = this.plistObject.CFBundleURLTypes || []

    // var versionNumber = parseInt(plistObject["CFBundleVersion"])
    // plistObject["CFBundleVersion"] = '' + ++versionNumber

    // TODO START move the following to the facebook repo
    var fbAppID = this.opts.vigour.facebook && this.opts.vigour.facebook.appId
    if (fbAppID) {
      let fbScheme = 'fb' + fbAppID
      log.info('configuring facebook', this.productName, fbAppID, fbScheme)

      this.plistObject.FacebookAppID = fbAppID
      this.plistObject.FacebookDisplayName = this.productName
      let types = this.plistObject.CFBundleURLTypes
      let len = types.length
      let found = false
      for (let i = 0; i < len && !found; i += 1) {
        let schemes = types[i].CFBundleURLSchemes
        if (schemes) {
          let ll = schemes.length
          for (let j = 0; j < ll && !found; j += 1) {
            if (schemes[j].indexOf('fb') === 0) {
              found = true
              schemes[j] = fbScheme
            }
          }
        }
      }
      if (!found) {
        this.plistObject.CFBundleURLTypes.push({
          CFBundleURLSchemes: [fbScheme]
        })
      }
    }
    // TODO END

    if (this.organizationIdentifier) {
      this.plistObject.CFBundleIdentifier = this.organizationIdentifier
    }

    if (this.buildNumber) {
      this.plistObject.CFBundleVersion = this.buildNumber
    }

    if (this.productName) {
      this.plistObject.CFBundleName = this.productName
    }

    if (this.interfaceOrientations && this.interfaceOrientations.iPhone) {
      this.plistObject['UISupportedInterfaceOrientations'] = []
      for (var orientation in this.interfaceOrientations.iPhone) {
        this.plistObject['UISupportedInterfaceOrientations'].push('UIInterfaceOrientation' + this.interfaceOrientations.iPhone[orientation])
        log.info('orientations', this.plistObject.UISupportedInterfaceOrientations)
      }
    } else {
      this.plistObject.UISupportedInterfaceOrientations = ['UIInterfaceOrientationPortrait', 'UIInterfaceOrientationPortraitUpsideDown', 'UIInterfaceOrientationLandscapeLeft', 'UIInterfaceOrientationLandscapeRight']
    }

    // if (this.interfaceOrientations && this.interfaceOrientations.iPad) {
    //   this.plistObject['UISupportedInterfaceOrientations~ipad'] = []
    //   for (var orientation in this.interfaceOrientations.iPad) {
    //     this.plistObject['UISupportedInterfaceOrientations~ipad'].push('UIInterfaceOrientation' + orientation)
    //   }
    //   this.plistObject['UISupportedInterfaceOrientations~ipad'] = this.interfaceOrientationsPad
    // } else {
    //   this.plistObject['UISupportedInterfaceOrientations~ipad'] = ['UIInterfaceOrientationPortrait', 'UIInterfaceOrientationPortraitUpsideDown', 'UIInterfaceOrientationLandscapeLeft', 'UIInterfaceOrientationLandscapeRight']
    // }

    if (this.appUrlIdentifier && this.appUrlScheme) {
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
  } else {
    log.info('- skipping configure project -')
  }
}
