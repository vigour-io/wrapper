/* global describe, it, expect, sinon */

var path = require('path')
var build = require('../../../../lib/build')
var tasks = require('../../../../lib/build/android/tasks.js')
var logStream = require('fs').createWriteStream('android-test.log')
var log = require('npmlog')
log.stream = logStream
// TODO Remove dependency on vigour-example being checkout-out in same
// directory as vigour-native, perhaps by making vigour-example a submodule?
var repo = path.join(__dirname
  , '..', '..', '..', '..', '..', 'vigour-example')
var pkgPath = path.join(repo, 'package.json')

var opts =
{ configFiles: pkgPath,
  vigour: {
    native: {
      root: repo,
      platforms: {
        android: {
          version: '2.1.4',
          versionCode: 27,
          applicationId: 'org.test',
          // logToFile: 1,
          appIndexPath: 'src/index.html'
        }
      }
    }
  }
}

var timeout = 60000

describe('android-scripts', function () {
  describe('installTemplate', function () {
    it('should copy all files to empty dir')
    it('should not copy build and Android Studio files')
    it('should not copy older files')
    it('should overwrite newer files')
  })

  describe('setAppIndexPath', function () {
    it('should overwrite the file to load in java')
  })

  describe('installImages', function () {
    it('should create launch icons from image')
    it('should create splash screens from image')
  })

  describe('assemble', function () {
    it('should call gradle with params for the relevant options', function () {
      var exeStub = sinon.stub(tasks, 'exe').returns(Promise.resolve())
      return tasks.assembleDebug(opts.vigour.native.platforms.android)
        .then(function (opts) {
          expect(exeStub.calledOnce).to.be.true
          var command = exeStub.args[0][0]
          expect(command).to.contain('-PverName=2.1.4')
          expect(command).to.contain('-PverCode=27')
          expect(command).to.contain('-PandroidAppId=org.test')
          exeStub.restore()
        })
    })
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

describe('android build', function () {
  it('should succeed in under ' + timeout + ' milliseconds!'
    , function () {
      this.timeout(timeout)
      var platform = 'android'
      opts.vigour.native.selectedPlatforms = platform
      return build(opts)
        .then(checkSuccess)
    })
})

function checkSuccess (success) {
  expect(success).to.equal(true)
}
