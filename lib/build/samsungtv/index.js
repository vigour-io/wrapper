var fs = require('vigour-fs')
var rimraf = require('rimraf')
var path = require('path')
var Promise = require('promise')
var nativeUtil = require('../../util')
var log = require('npmlog')
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
    .then(zipAll)
    .then(buildWidgetList)
    .then(function () {
      log.info('__FINISHED__')
      return true
    })
    .catch(function () {
      log.info(arguments, 'error')
    })
}

function configure (opts) {
  var options = opts.vigour.native.platforms.samsungtv
  options.root = opts.vigour.native.root
  options.templateSrc = path.join(__dirname, '..', '..', '..', 'templates', 'samsungtv')
  options.buildDir = path.join(options.root, 'build', 'samsungtv', 'samsung')
  options.packer = opts.vigour.packer
  options.main = options.main || path.join(options.root, 'build.js')
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
    var file = fs.createReadStream(opts.root + '/build.html').pipe(fs.createWriteStream(opts.buildDir + '/index.html'))
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
