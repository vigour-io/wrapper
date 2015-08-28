var fs = require('vigour-fs')
  , rimraf = require('rimraf')
  , path = require('path')
  , ncp = require('ncp')
  , Promise = require('promise')
  , xcode = require('xcode')
  , plist = require('plist')
  , browserify = require('browserify')
  , concat = require('concat-stream')
  , log = require('npmlog')
  , _mkdir = Promise.denodeify(fs.mkdirp)
  , _ncp = Promise.denodeify(ncp)
  , _rimraf = Promise.denodeify(rimraf)
  , _readFile = Promise.denodeify(fs.readFile)
  , _writeFile = Promise.denodeify(fs.writeFile)
  , nativeUtil = require('../../util')


module.exports = exports = function (opts, shared) {
  console.log('- start LG build -')
  return Promise.resolve(opts)
    .then(configure)
    .then(clean)
    .then(createStructure)
    .then(copyHtml)
    .then(copyJsBuild)
    .then(copyCssBuild)
    .then(zipAll)
    .then(function() {
      console.log("__FINISHED__")
      return true
    })
    .catch(function () {
      console.log(arguments, "error")
    })
}

function configure (opts) {
  console.log('- creating foder LG TV build dir -')
  var options = opts.native.platforms.lgtv
  options.root = opts.native.root
  options.templateSrc = path.join(__dirname, '..', '..', '..', 'templates', 'lgtv')
  options.buildDir = path.join(options.root, 'build', 'lgtv','WebContent')
  return(options)
}

function clean (opts) {
  console.log('- clean LG TV build dir -')
  return _rimraf(opts.buildDir)
    .then(function () {
      return opts
    })
}

function createStructure (opts) {
  console.log("- creating folder structure for LG TV-")

  return _mkdir(opts.buildDir)
    .then(function () {
      return opts
    })
}

function copyHtml (opts) {
  console.log("- Copying the AppInfo.JSON -")
  return new Promise(function (resolve, reject) {
    var file = fs.createReadStream(opts.root + '/build.html').pipe(fs.createWriteStream(opts.buildDir + '/index.html'))
    file.on('close', function () {
      nativeUtil.buildIndexHtmlForLG(opts.buildDir + '/index.html')
      resolve(opts)
    })
  })
}

function copyJsBuild (opts) {
  log.info('- creating the js for LG TV-')
  return new Promise(function (resolve, reject) {
    var file = fs.createReadStream(opts.root + '/build.js').pipe(fs.createWriteStream(opts.buildDir + '/build.js'))
    file.on('close', function () {
      resolve(opts)
    })
  })
}

function copyCssBuild (opts) {
  log.info('- creating the css for LG TV-')
  return new Promise(function (resolve, reject) {
    var file = fs.createReadStream(opts.root + '/build.css').pipe(fs.createWriteStream(opts.buildDir + '/build.css'))
    file.on('close', function () {
      resolve(opts)
    })
  })
}

function zipAll (opts) {
  log.info('- creating the Zip file for LG TV-')
  return new Promise(function (resolve, reject) {
    nativeUtil.zip(opts.buildDir, opts.buildDir + '.zip', function (filesize) {
      resolve(opts)
    })
  })
}
