'use strict'

var path = require('path')
var builderPath = '../../../../lib/builder'
var Builder = require(builderPath)
var AndroidTasks = require(builderPath + '/android')
var fs = require('vigour-fs/lib/server')
var Promise = require('promise')
var mkdirp = Promise.denodeify(fs.mkdirp)
var readFile = Promise.denodeify(fs.readFile)
var writeFile = Promise.denodeify(fs.writeFile)
var readXML = Promise.denodeify(fs.readXML)
var remove = Promise.denodeify(fs.remove)
var readDir = Promise.denodeify(fs.readdir)

// var logStream = fs.createWriteStream('android-test.log')
var log = require('npmlog')
var log_stream = log.stream
// log.stream = logStream

var repo = path.join(__dirname, '..', '..', '..', 'app')
var pkgPath = path.join(repo, 'package.json')
var fixturePath = path.join(__dirname, '..', 'fixtures')

var opts = {
  _packageDir: pkgPath,
  vigour: {
    native: {
      builds: true,
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

var timeout = 2 * 60 * 1000

describe('android-scripts', function () {
  var android = new AndroidTasks(opts)
  android.exe = sinon.stub().returns(Promise.resolve())
  android.log = {
    info: function () {}
  }

  describe('installTemplate', function () {
    var tmpDir = path.join(__dirname, 'tmp', 'template')
    var templatePath = path.join(fixturePath, 'copyTest')

    it('should copy all files to empty dir', function () {
      return readDir(tmpDir)
        .then(function (contents) {
          expect(contents).to.not.be.empty
        })
    })
    it('should not copy build and Android Studio files', function () {
      return readDir(tmpDir)
        .then(function (contents) {
          expect(contents).to.not.contain('.idea')
          expect(contents).to.not.contain('build')
        })
    })
    it('should not copy older files', function () {
      var file = path.join(tmpDir, 'settings.gradle')
      fs.writeFileSync(file, 'edited!')
      return runInstall()
        .then(function () {
          var contents = fs.readFileSync(file, 'utf8')
          expect(contents).to.equal('edited!')
        })
    })
    it('should overwrite newer files', function () {
      var file = path.join(tmpDir, 'settings.gradle')
      // wait 1000 msec. otherwise we can't test that newer files will be overwritten because of filesystem time resolution
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          resolve()
        }, 1000)
      })
        .then(function () {
          fs.writeFileSync(path.join(templatePath, 'settings.gradle'), '// some gradle file')
        })
        .then(runInstall)
        .then(function () {
          var contents = fs.readFileSync(file, 'utf8')
          expect(contents).to.equal('// some gradle file')
        })
    })

    it('should overwrite main java and gradle file', function () {
      var javaPath = path.join(tmpDir, 'app', 'MainActivity.java')
      var gradlePath = path.join(tmpDir, 'app', 'build.gradle')
      fs.writeFileSync(javaPath, 'edited!')
      fs.writeFileSync(gradlePath, 'edited!')
      return runInstall()
        .then(function () {
          var javaContents = fs.readFileSync(javaPath, 'utf8')
          var gradleContents = fs.readFileSync(gradlePath, 'utf8')
          expect(javaContents).to.eql('// some java file\n')
          expect(gradleContents).to.eql('// some gradle file\n')
        })
    })

    function runInstall () {
      android.buildDir = tmpDir
      android.templateSrc = templatePath
      return android.installTemplate()
    }

    before(function () {
      return remove(tmpDir)
        .then(runInstall)
    })

    after(function () {
      return remove(tmpDir)
    })
  })

  describe('customizeTemplate', function () {
    var values = {}
    var tmpPath = path.join(__dirname, 'tmp', 'res', 'values')
    var tmpFile = path.join(tmpPath, 'template.xml')

    before(function () {
      return mkdirp(tmpPath)
        .then(function () {
          return readFile(path.join(fixturePath, 'template.xml'))
        })
        .then(function (file) {
          return writeFile(tmpFile, file)
        })
        .then(function () {
          android.srcDir = path.join(__dirname, 'tmp')
          android.appIndexPath = 'path/to/app/index.js'
          android.productName = 'The Product!'
          android.splashDuration = 1234
          return android.customizeTemplate()
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
    var tmpDir = path.join(__dirname, 'tmp', 'template')
    var shutterStub
    var oldRoot

    it('should do nothing without options', function () {
      shutterStub.reset()
      return android.installImages()
        .then(function () {
          expect(shutterStub.callCount).to.eql(0)
        })
    })

    it('should create launch icons from image', function () {
      shutterStub.reset()
      delete android['appIcon']
      android.splashScreen = 'test.png'
      return android.installImages()
        .then(function () {
          expect(shutterStub.callCount).to.eql(1)
          expect(shutterStub.args[0][0].manip[0].src).to.eql(path.join(fixturePath, android.splashScreen))
          expect(shutterStub.args[0][0].manip[0].batch).to.have.length(2)
        })
    })

    it('should create splash screens from image', function () {
      shutterStub.reset()
      delete android['splashScreen']
      android.appIcon = 'test.png'
      return android.installImages()
        .then(function () {
          expect(shutterStub.callCount).to.eql(1)
          expect(shutterStub.args[0][0].manip[0].src).to.eql(path.join(fixturePath, android.appIcon))
          expect(shutterStub.args[0][0].manip[0].batch).to.have.length(4)
        })
    })

    it('should skip images that are already resized', function () {
      shutterStub.reset()
      // right now the files are cached
      android.splashScreen = 'test.png'
      android.appIcon = 'test.png'
      return android.installImages()
        .then(function () {
          expect(shutterStub.callCount).to.eql(0)
        })
    })

    before(function () {
      shutterStub = sinon.stub().returns(Promise.resolve())
      android.shutter = shutterStub
      oldRoot = android.root
      android.root = fixturePath
      var cachePath = path.join(android.buildDir, 'cache.json')
      return mkdirp(tmpDir)
        .then(remove(cachePath))
    })

    after(function () {
      android.root = oldRoot
    })
  })

  describe('installing plugins', function () {
    it('should init all plugins in main java file')
    it('should add all plugin libs as dependency')
    it('should add all plugin permissions to the manifest')
    it('should work without any plugins', function () {
      return android.installPlugins()
        .then(function () {
          expect(true).to.be.true
        })
        .catch(function (error) {
          expect(error).to.not.exist
        })
    })
  })

  describe('assemble', function () {
    it('should call gradle with params for the relevant options', function () {
      android.exe.reset()
      return android.assemble()
        .then(function () {
          expect(android.exe).calledOnce
          var command = android.exe.args[0][0]
          expect(command).to.contain('-PverName=2.1.4')
          expect(command).to.contain('-PverCode=27')
          expect(command).to.contain('-PandroidAppId=org.test')
        })
    })
  })

  describe('install & run', function () {
    it('should not install & run if not set in options', function () {
      android.run = false
      android.exe.reset()
      android.installRun()
        .then(function () {
          expect(android.exe.callCount).to.eql(0)
        })
    })

    it('should install & run if set in options', function () {
      android.run = true
      android.exe.reset()
      android.installRun()
        .then(function () {
          expect(android.exe.callCount).to.eql(2)
        })
    })

    it('should use correct options to install apk', function () {
      expect(android.exe.getCall(0).args[0]).to.contain(android.apkNameBase)
    })
    it('should use correct options to run app', function () {
      expect(android.exe.getCall(1).args[0]).to.contain(android.applicationId)
    })
  })
})

describe('android build', function () {
  it('should succeed in under ' + timeout + ' milliseconds!'
    , function () {
      this.timeout(timeout)
      var platform = 'android'
      opts.vigour.native.selectedPlatforms = platform
      var builder = new Builder(opts)
      return builder.start()
        .then(checkSuccess)
    })
  after(function () {
    log.stream = log_stream
  })
})

function checkSuccess (success) {
  expect(success).to.equal(true)
}
