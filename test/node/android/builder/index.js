/* global describe, it, expect, before, after, sinon */

var path = require('path')
var builder = require('../../../../lib/builder')
var assemble = require('../../../../lib/builder/android/assemble')
var exe = require('../../../../lib/exe')
var customizeTemplate = require('../../../../lib/builder/android/customizeTemplate')
var fs = require('vigour-fs/lib/server')
var Promise = require('promise')
var mkdirp = Promise.denodeify(fs.mkdirp)
var readFile = Promise.denodeify(fs.readFile)
var writeFile = Promise.denodeify(fs.writeFile)
var readXML = Promise.denodeify(fs.readXML)
var remove = Promise.denodeify(fs.remove)

// var logStream = fs.createWriteStream('android-test.log')
var log = require('npmlog')
var log_stream = log.stream
// log.stream = logStream

var repo = path.join(__dirname
  , '..', '..', '..', 'app')
var pkgPath = path.join(repo, 'package.json')
var fixturePath = path.join(__dirname, '..', 'fixtures', 'template.xml')

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
          appIndexPath: 'bundle.html',
          buildDir: path.join(repo, 'build', 'android')
        }
      }
    }
  }
}

var timeout = 5 * 60 * 1000

describe('android-scripts', function () {
  describe('installTemplate', function () {
    it('should copy all files to empty dir')
    it('should not copy build and Android Studio files')
    it('should not copy older files')
    it('should overwrite newer files')
  })

  describe('customizeTemplate', function () {
    var values = {}
    var tmpPath = path.join(__dirname, 'tmp', 'res', 'values')
    var tmpFile = path.join(tmpPath, 'template.xml')

    before(function () {
      return mkdirp(tmpPath)
        .then(function () {
          return readFile(fixturePath)
        })
        .then(function (file) {
          return writeFile(tmpFile, file)
        })
        .then(function () {
          var opts = {
            srcDir: path.join(__dirname, 'tmp'),
            appIndexPath: 'path/to/app/index.js',
            productName: 'The Product!',
            splashDuration: 1234
          }
          return customizeTemplate.call(opts)
        })
        .then(function () {
          return readXML(tmpFile)
        })
        .then(function (modifiedXml) {
          values = modifiedXml
          return Promise.resolve(true)
        })
    })

    it('should set path of js app', function () {
      expect(values.resources.string[1]._).to.equal('path/to/app/index.js')
    })
    it('should set app name', function () {
      expect(values.resources.string[0]._).to.equal('The Product!')
    })
    it('should set splash timeout', function () {
      expect(values.resources.integer[0]._).to.equal('1234')
    })

    after(function () {
      remove(tmpPath)
    })
  })

  describe('installImages', function () {
    it('should create launch icons from image')
    it('should create splash screens from image')
  })

  describe('assemble', function () {
    it('should call gradle with params for the relevant options', function () {
      var tasks = {
        exe: exe
      }
      var exeStub = sinon.stub(tasks, 'exe').returns(Promise.resolve())
      try {
        return assemble.call(opts.vigour.native.platforms.android)
          .then(function () {
            expect(exeStub).calledOnce
            var command = exeStub.args[0][0]
            expect(command).to.contain('-PverName=2.1.4')
            expect(command).to.contain('-PverCode=27')
            expect(command).to.contain('-PandroidAppId=org.test')
            exeStub.restore()
          })
      } catch (error) {
        log.warn(error, error)
        exeStub.restore()
        expect(error).to.not.exist
      }
    })
  })

  describe('install & run', function () {
    it('should only install & run if set in options')
    it('should use correct options to install apk')
    it('should use correct options to run app')
  })

  describe('installing plugins', function () {
    it('should init all plugins in main java file')
    it('should deploy all plugins to local repository')
    it('should add all plugin libs as dependency')
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
      return builder(opts)
        .then(checkSuccess)
    })
  after(function () {
    log.stream = log_stream
  })
})

function checkSuccess (success) {
  expect(success).to.equal(true)
}
