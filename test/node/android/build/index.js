/* global describe, it, expect */

var path = require('path')
var build = require('../../../../lib/build')

// TODO Remove dependency on vigour-example being checkout-out in same directory as vigour-native, perhaps by making vigour-example a submodule?
var repo = path.join(__dirname
  , '..', '..', '..', '..', '..', 'vigour-example')
var pkgPath = path.join(repo, 'package.json')
var opts =
{ configFiles: pkgPath,
  vigour: {
    native: {
      root: repo
    }
  }
}

var options = JSON.stringify(opts)
var timeout = 60000

describe('android-scripts', function () {
  describe('installTemplate', function () {
    it('should copy all files to empty dir')
    it('should not copy build and Android Studio files')
    it('should not copy older files')
    it('should overwrite newer files')
  })

  describe('assemble', function () {
    it('should call gradle with params for the relevant options')
  })

  describe('install & run', function () {
    it('should only install & run if set in options')
    it('should use correct options to install apk')
    it('should use correct options to run app')
  })

  describe('installing plugins', function () {
    it('should init all plugins in main java file')
    it('should build all plugins to .aar')
    it('should add all .aar files to libs')
    it('should add all .aar libs as dependency')
    it('should add all plugin permissions to the manifest')
    it('should work without any plugins')
  })
})

describe('build', function () {
  it('android should succeed in under ' + timeout + ' milliseconds!'
    , function () {
      this.timeout(timeout)
      var _options = JSON.parse(options)
      var platform = 'android'
      _options.vigour.native.selectedPlatforms = platform
      return build(_options)
        .then(checkSuccess)
    })
})

function checkSuccess (success) {
  expect(success).to.equal(true)
}
