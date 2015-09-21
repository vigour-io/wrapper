#!/usr/bin/env node
var path = require('path')

var program = require('commander')
var Promise = require('promise')

var fs = require('vigour-fs/lib/server')
var vBuild = require('../lib/build')

var readFile = Promise.denodeify(fs.readFile)
var fs_exists = function (p) {
  return new Promise(function (resolve, reject) {
    fs.exists(p, resolve)
  })
}

var buildFactory = function (cwd) {
  return function (platforms) {
    build(platforms, cwd)
  }
}

program
  .version('0.0.1')
  .command('build [platforms...]')
  .action(buildFactory(process.cwd()))

program.parse(process.argv)

function build (platforms, cwd) {
  var pkgPath = path.join(cwd, 'package.json')
  console.log('arg')
  fs_exists(pkgPath)
    .then(function (exists) {
      var error
      if (!exists) {
        error = new Error("Can't find package.json")
        error.shouldBeHere = pkgPath
        throw error
      } else {
        return pkgPath
      }
    })
    .then(readFile)
    .then(function (contents) {
      var parsed = JSON.parse(contents)
      var key
      if (!parsed.vigour || !parsed.vigour.native || !parsed.vigour.packer.assets) {
        throw new Error('package.json must contain vigour.native and vigour.packer.assets, see README.md')
      }
      parsed.vigour.native.root = cwd
      if (platforms.length > 0) {
        for (key in parsed.vigour.native.platforms) {
          if (!~platforms.indexOf(key)) {
            parsed.vigour.native.platforms[key] = false
          }
        }
      }
      parsed.vigour.native.cwd = cwd  // TODO Document this
      parsed.vigour.native.packer = parsed.vigour.packer
      return vBuild(parsed.vigour.native)
    })
    .then(function (meta) {
      console.log('Build done in ' + meta.time + 'ms')
    }, function (reason) {
      console.error('Failure', reason, reason.stack)
    })
}
