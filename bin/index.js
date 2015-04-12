#!/usr/bin/env node
var path = require('path')

  , program = require('commander') 
  , Promise = require('promise')

  , fs = require('vigour-fs')
  , vBuild = require('../lib/build')

  , readFile = Promise.denodeify(fs.readFile)
  , fs_exists = function (p) {
    return new Promise(function (resolve, reject) {
      fs.exists(p, resolve)
    })
  }
  
  , buildFactory = function (cwd) {
    return function (platforms) {
      build(platforms, cwd)
    }
  }
console.log("oooo", process.argv)
program
  .version('0.0.1')
  .command('build [platforms...]')
  .action(buildFactory(process.cwd()))

program.parse(process.argv)

function build (platforms, cwd) {
  var pkgPath = path.join(cwd, 'package.json')
  console.log("arg")
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
        , key
      if (!parsed.vigour || !parsed.vigour.native) {
        throw new Error("package.json must contain vigour.native, see README.md")
      }
      parsed.vigour.native.root = cwd
      if (platforms.length > 0) {
        for (key in parsed.vigour.native.platforms) {
          if (!~platforms.indexOf(key)) {
            parsed.vigour.native.platforms[key] = false
          }
        }
      }
      return vBuild(parsed.vigour.native)
    })
    .then(function (meta) {
      console.log("Build done in " + meta.time + "ms")
    }, function (reason) {
      console.error("Failure", reason, reason.stack)
    })
}