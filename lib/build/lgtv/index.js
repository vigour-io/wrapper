var fs = require('vigour-fs')
var rimraf = require('rimraf')
var path = require('path')
var ncp = require('ncp')
var Promise = require('promise')
var log = require('npmlog')
var _mkdir = Promise.denodeify(fs.mkdirp)
var _rimraf = Promise.denodeify(rimraf)
var nativeUtil = require('../../util')


module.exports = exports = function (opts, shared) {
  console.log('- start LG Net Cast TV build -')
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
  log.info('- creating foder LG Net Cast TV build dir-')
  var options = opts.native.platforms.lgtv
  options.root = opts.native.root
  options.templateSrc = path.join(__dirname, '..', '..', '..', 'templates', 'lgtv')
  options.buildDir = path.join(options.root, 'build', 'lgtv','WebContent')
  return(options)
}

function clean (opts) {
  log.info('- clean LG Net Cast TV build dir-')
  return _rimraf(opts.buildDir)
    .then(function () {
      return opts
    })
}

function createStructure (opts) {
  log.info("- creating folder structure for LG Net Cast TV-")

  return _mkdir(opts.buildDir)
    .then(function () {
      return opts
    })
}

function copyHtml (opts) {
  log.info("- Copying LG Net Cast TV html file-")
  return new Promise(function (resolve, reject) {
    var file = fs.createReadStream(opts.root + '/build.html').pipe(fs.createWriteStream(opts.buildDir + '/index.html'))
    file.on('close', function () {
      nativeUtil.buildIndexHtmlForLG(opts.buildDir + '/index.html')
      resolve(opts)
    })
  })
}

function copyJsBuild (opts) {
  log.info('- creating the js for LG Net Cast TV-')
  return new Promise(function (resolve, reject) {
    var file = fs.createReadStream(opts.root + '/build.js').pipe(fs.createWriteStream(opts.buildDir + '/build.js'))
    file.on('close', function () {
      resolve(opts)
    })
  })
}

function copyCssBuild (opts) {
  log.info('- creating the css for LG Net Cast TV-')
  return new Promise(function (resolve, reject) {
    var file = fs.createReadStream(opts.root + '/build.css').pipe(fs.createWriteStream(opts.buildDir + '/build.css'))
    file.on('close', function () {
      resolve(opts)
    })
  })
}

function zipAll (opts) {
  log.info('- creating the Zip file for LG Net Cast TV-')
  return new Promise(function (resolve, reject) {
    nativeUtil.zip(opts.buildDir, opts.buildDir + '.zip', function (filesize) {
      resolve(opts)
    })
  })
}
