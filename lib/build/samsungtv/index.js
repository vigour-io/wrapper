var fs = require('vigour-fs/lib/server')
var rimraf = require('rimraf')
var path = require('path')
var Promise = require('promise')
var nativeUtil = require('../../util')
var log = require('npmlog')
var imgServer = require('vigour-img')
var _mkdir = Promise.denodeify(fs.mkdirp)
var _rimraf = Promise.denodeify(rimraf)

module.exports = exports = function (opts, shared) {
  log.info('------ Building Samsung TV ------')
  return Promise.resolve(opts)
    .then(configure)
    .then(clean)
    .then(createStructure)
    .then(buildWidgetInfo)
    .then(buildConfigXml)
    .then(buildEclipseProject)
    .then(buildHtml)
    .then(copyJsBuild)
    .then(copyCssBuild)
    .then(createUninstallFile)
    .then(createVersionFile)
    .then(checkIconsPath)
    .then(zipAll)
    .then(buildWidgetList)
    .then(function () {
      log.info('__FINISHED__')
      return true
    })
    .catch(shared.handleErrors('samsungtv'))
}

function configure (opts) {
  var options = opts.vigour.native.platforms.samsungtv
  options.root = opts.vigour.native.root
  options.templateSrc = path.join(__dirname, '..', '..', '..', 'templates', 'samsungtv')
  options.buildDir = path.join(options.root, 'build', 'samsungtv', 'samsung')
  options.packer = opts.vigour.packer
  options.main = options.main || path.join(options.root, 'build.js')
  options.mainHtml = options.mainHtml || path.join(options.root, 'build.html')
  return (options)
}

function clean (opts) {
  log.info('- clean samsung TV build dir -')
  return _rimraf(opts.buildDir)
    .then(function () {
      return opts
    })
}

function createStructure (opts) {
  log.info('- creating folder structure for samsung TV-')

  return _mkdir(opts.buildDir)
    .then(function () {
      _mkdir(opts.buildDir + '/icons')
    }).then(function () {
      return opts
    })
}

function buildWidgetInfo (opts) {
  log.info('- creating widget info for samsung TV-')
  return new Promise(function (resolve, reject) {
    var file = fs.createReadStream(opts.templateSrc + '/widget.info').pipe(fs.createWriteStream(opts.buildDir + '/widget.info'))
    file.on('close', function () {
      resolve(opts)
    })
  })
}

function buildConfigXml (opts) {
  log.info('- creating config.xml for samsung TV-')
  return new Promise(function (resolve, reject) {
    nativeUtil.transform_template(opts.templateSrc + '/config.xml', opts.buildDir + '/config.xml', opts.xmlConfig)
    resolve(opts)
  })
}

function buildEclipseProject (opts) {
  log.info('eclipsee')
  return new Promise(function (resolve, reject) {
    nativeUtil.transform_template(opts.templateSrc + '/eclipse.project', opts.buildDir + '/.project', opts.xmlConfig)
    resolve(opts)
  })
}

function buildHtml (opts) {
  log.info('- creating the html for samsung TV-')
  return new Promise(function (resolve, reject) {
    var file = fs.createReadStream(opts.mainHtml).pipe(fs.createWriteStream(opts.buildDir + '/index.html'))
    file.on('close', function () {
      nativeUtil.buildIndexHtml(opts.buildDir + '/index.html', opts.url)
      resolve(opts)
    })
  })
}

function copyJsBuild (opts) {
  log.info('- creating the js for samsung TV-')
  return new Promise(function (resolve, reject) {
    var file = fs.createReadStream(opts.main).pipe(fs.createWriteStream(opts.buildDir + '/build.js'))
    file.on('close', function () {
      resolve(opts)
    })
  })
}

function copyCssBuild (opts) {
  log.info('- creating the css for samsung TV-')
  return new Promise(function (resolve, reject) {
    var file = fs.createReadStream(opts.root + '/build.css').pipe(fs.createWriteStream(opts.buildDir + '/build.css'))
    file.on('close', function () {
      resolve(opts)
    })
  })
}

function createUninstallFile (opts) {
  log.info('- creating the uninstall file for samsung TV-')
  return new Promise(function (resolve, reject) {
    var file = fs.createReadStream(opts.templateSrc + '/uninstall.js').pipe(fs.createWriteStream(opts.buildDir + '/Uninstall.js'))
    file.on('close', function () {
      resolve(opts)
    })
  })
}

function createVersionFile (opts) {
  log.info('- creating the version file for samsung TV-')
  return new Promise(function (resolve, reject) {
    var file = fs.createReadStream(opts.templateSrc + '/version.js').pipe(fs.createWriteStream(opts.buildDir + '/version.js'))
    file.on('close', function () {
      resolve(opts)
    })
  })
}

function checkIconsPath (opts) {
  log.info('- Copying and resizing all the icons, It may take a while.. -')
  var images = JSON.stringify(opts.xmlConfig.icons)
  var parsed = JSON.parse(images)
  var arr = []
  return new Promise(function (resolve, reject) {
    for (var file in parsed) {
      console.log('path', path.join(opts.root, parsed[file]))
      if (fs.existsSync(path.join(opts.root, parsed[file]))) {
        if (file === 'ThumbIcon') {
          arr.push({
            src: path.join(opts.root, parsed[file]),
            dst: opts.buildDir + '/icons/' + file + '.png',
            width: 106,
            height: 86,
            outType: 'png'
          })
        } else if (file === 'BigThumbIcon') {
          arr.push({
            src: path.join(opts.root, parsed[file]),
            dst: opts.buildDir + '/icons/' + file + '.png',
            width: 115,
            height: 95,
            outType: 'png'
          })
        } else if (file === 'ListIcon') {
          arr.push({
            src: path.join(opts.root, parsed[file]),
            dst: opts.buildDir + '/icons/' + file + '.png',
            width: 85,
            height: 70,
            outType: 'png'
          })
        } else if (file === 'BigListIcon') {
          arr.push({
            src: path.join(opts.root, parsed[file]),
            dst: opts.buildDir + '/icons/' + file + '.png',
            width: 95,
            height: 78,
            outType: 'png'
          })
        }
      } else {
        var error = new Error('ENOTFOUND')
        error.info = {
          file: parsed[file]
        }
        throw error
      }
    }
    imgServer({convertPath: 'forceUseOfRemote', manip: arr}).then(function () {
      resolve(opts)
    })
  })
}

function zipAll (opts) {
  log.info('- creating the Zip file for samsung TV-')
  return new Promise(function (resolve, reject) {
    nativeUtil.zip(opts.buildDir, opts.buildDir + '.zip', function (filesize) {
      opts.xmlConfig.size = filesize
      opts.xmlConfig.ip = nativeUtil.getIP(opts)
      resolve(opts)
    })
  })
}

function buildWidgetList (opts) {
  log.info('- creating the widget list for samsung TV-')
  return new Promise(function (resolve, reject) {
    nativeUtil.transform_template(opts.templateSrc + '/widgetlist.xml', opts.root + '/build/samsungtv/widgetlist.xml', opts.xmlConfig)
    resolve(opts)
  })
}
