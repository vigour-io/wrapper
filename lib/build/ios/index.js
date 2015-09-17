var fs = require('vigour-fs')
var rimraf = require('rimraf')
var path = require('path')
var ncp = require('ncp')
var Promise = require('promise')
var xcode = require('xcode')
var plist = require('plist')
var browserify = require('browserify')
var concat = require('concat-stream')
var log = require('npmlog')
var mkdirp = Promise.denodeify(fs.mkdirp)
var _ncp = Promise.denodeify(ncp)
var _rimraf = Promise.denodeify(rimraf)
var readFile = Promise.denodeify(fs.readFile)
var writeFile = Promise.denodeify(fs.writeFile)
var readJSON = Promise.denodeify(fs.readJSON)
var writeJSON = Promise.denodeify(fs.writeJSON)
var imgServer = require('vigour-img')

module.exports = exports = function (opts, shared) {
  log.info('- start ios build -')
  // log.info("OPTIONS", JSON.stringify(opts, null, 2))
  return Promise.resolve(opts)
    .then(configure)
    .then(clean)
    .then(prepare)
    .then(configureTemplate)
    .then(modifyPlist)
    .then(nativeAssets)
    .then(shared.copyAssets)
    .then(addBridge)
    .then(function () {
      log.info('__FINISHED__')
      return true
    })
    .catch(shared.handleErrors('ios'))
}

function configure (opts) {
  log.info('- configure ios build paths -')
  var options = opts.vigour.native.platforms.ios
  options.root = opts.vigour.native.root
  options.templateSrc = path.join(__dirname, '..', '..', '..', 'templates', 'ios')
  options.buildDir = path.join(options.root, 'build', 'ios')
  options.wwwDst = path.join(options.buildDir, 'vigour-native', 'www')
  options.plugins = opts.vigour.native.plugins
  options.packer = opts.vigour.packer
  return options
}

function clean (opts) {
  log.info('- clean ios build dir -')
  return _rimraf(opts.buildDir)
    .then(function () {
      return opts
    })
}

function prepare (opts) {
  log.info('- prepare ios template -')
  return mkdirp(opts.buildDir)
    .then(function () {
      return _ncp(opts.templateSrc
          , opts.buildDir
          , { clobber: true })
    })
		.then(function () { //clean out www
			return _rimraf(opts.wwwDst)
		})
		.then(function () {
			return mkdirp(opts.wwwDst)
		})
    .then(function () {
      return opts
    })
}

/**
    configure the template xcode project
  */
function configureTemplate (opts) {
  log.info('- configure template -')
  opts.projectPath = path.join(opts.buildDir, 'vigour-native/vigour-native.xcodeproj/project.pbxproj')
  var templateProj = xcode.project(opts.projectPath)
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
        fs.writeFileSync(opts.projectPath, templateProj.writeSync())
        resolve(opts)
      }
    })
  })
}

/**
      Helpers
 **/

// function replaceSpacesWithDashes (/*String*/ str) {
//   return str.replace(/\s+/g, '-').toLowerCase()
// }

/**
    override default plist settings
 **/
function modifyPlist (opts) {
  log.info('- configure project -')
  opts.plistPath = path.join(opts.buildDir, 'vigour-native/vigour-native/Info.plist')
  opts.plistObject = plist.parse(fs.readFileSync(opts.plistPath, 'utf8'))

  // var versionNumber = parseInt(plistObject["CFBundleVersion"])
  // plistObject["CFBundleVersion"] = '' + ++versionNumber

  if (opts.organizationIdentifier) {
    opts.plistObject.CFBundleIdentifier = opts.organizationIdentifier
  }

  if (opts.buildNumber) {
    opts.plistObject.CFBundleVersion = opts.buildNumber
  }

  if (opts.productName) {
    opts.plistObject.CFBundleName = opts.productName
  }

  if (opts.appUrlIdentifier && opts.appUrlScheme) {
    opts.plistObject.CFBundleURLTypes = []
    var urlScheme = {
      CFBundleTypeRole: 'Editor',
      CFBundleURLName: opts.appUrlIdentifier,
      CFBundleURLSchemes: [opts.appUrlScheme]
    }
    opts.plistObject.CFBundleURLTypes.push(urlScheme)
  }

  if (opts.appIndexPath) {
    opts.plistObject.appIndexPath = opts.appIndexPath
  } else {
    throw new Error('platforms.ios.appIndexPath should be provided!')
  }

  fs.writeFileSync(opts.plistPath, plist.build(opts.plistObject))
  return opts
}

function nativeAssets (opts) {
  log.info('- creating images -')

  var tplBase = path.join(__dirname, '..', '..', '..', 'lib', 'build', 'ios')
  var xcodeAssetsPath = path.join(opts.buildDir, 'vigour-native', 'vigour-native', 'Images.xcassets')

  var imgOpts = {
    convertPath: 'forceUseOfRemote',
    manip: []
  }

  var categories = [
    {
      tpl: 'launchImgTpl.json',
      dir: 'LaunchImage.launchimage',
      prefix: 'splash',
      src: opts.splashScreen
    }, {
      tpl: 'appIconTpl.json',
      dir: 'AppIcon.appiconset',
      prefix: 'icon',
      src: opts.appIcon
    }
  ]

  return Promise.all(
    categories.map(function (category) {
      if (category.src) {
        var obj = {
          src: path.join(opts.root, category.src),
          batch: []
        }
        return readJSON(path.join(tplBase, category.tpl))
          .then(function (contents) {
            var i = 1
            var out = path.join(xcodeAssetsPath, category.dir)
            contents.images = contents.images.map(function (item) {
              item.filename = category.prefix + '-' + i + '.png'
              obj.batch.push({
                dst: path.join(out, item.filename),
                width: item.width,
                height: item.height,
                outType: 'png'
              })
              delete item.width
              delete item.height
              i += 1
              return item
            })
            return writeJSON(path.join(out, 'Contents.json'), contents, { mkdirp: true })
              .then(function () {
                if (obj.batch.length > 0) {
                  imgOpts.manip.push(obj)
                }
              })
          })
      }
    })
  ).then(function () {
    if (imgOpts.manip.length > 0) {
      return imgServer(imgOpts)
    }
  }).then(function () {
    return opts
  })
}

function addBridge (opts) {
  log.info('- adding bridge -')
  var bridgePath = path.join(__dirname, '..', '..', 'bridge', 'ios', 'index.js')
  var htmlPath = path.join(opts.wwwDst, opts.appIndexPath)
  var bro = browserify()
  var _html
  return readHtml()
    .then(buildBridge)
    .then(writeHtml)
    .then(function () {
      return opts
    })

  function readHtml () {
    return readFile(htmlPath, 'utf8')
      .then(function (html) {
        _html = html
      })
  }
  function buildBridge () {
    return new Promise(function (resolve, reject) {
      var out = concat('string', function (data) {
        resolve(data)
      })
      bro.add(bridgePath)
      bro.bundle().pipe(out)
      bro.on('error', reject)
    })
  }
  function writeHtml (bridgeCode) {
    var newHtml = _html.replace('<head>', "<head><script type='text/javascript'>" + bridgeCode + '</script>', 'i')
    return writeFile(htmlPath, newHtml, 'utf8')
  }
}
