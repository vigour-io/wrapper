var Promise = require('promise')

var pliant = require('pliant')
var log = require('npmlog')
var fs = require('vigour-fs')
var path = require('path')
var flatten = require('vigour-js/util/flatten.js')
var cp = Promise.denodeify(fs.cp)
var readJSON = Promise.denodeify(fs.readJSON)
var shared = {}
var config = require('./config')
var builders = {
  android: './android',
  ios: './ios',
  samsungtv: './samsungtv'
}

module.exports = exports = pliant.fn(function (opts) {
  var options = opts.vigour
  var platforms = options.native.platforms
  var selected = options.native.selectedPlatforms
  var platform

  var pluginPkgPaths = []
  var pluginPkgPath
  for (var key in opts.dependencies) {
    pluginPkgPath = path.join(options.native.root, 'node_modules', key, 'package.json')
    pluginPkgPaths.push(pluginPkgPath)
  }
  return Promise.all(pluginPkgPaths.map(function (pkgPath) {
    return readJSON(pkgPath)
      .then(function (pkg) {
        if (pkg.vigour && pkg.vigour.plugin) {
          pkg.vigour.plugin.name = pkg.name
          return pkg.vigour.plugin
        } else {
          return false
        }
      })
  }))
    .then(function (plugins) {
      plugins = plugins.filter(function (entry) {
        return entry
      })
      options.native.plugins = plugins
      var promise = Promise.resolve()
      if (platforms) {
        for (platform in options.native.platforms) {
          if (platforms[platform] &&
            (!selected || ~selected.indexOf(platform)) &&
            builders[platform]) {
            promise = promise.then(builderFactory(platform, options))
          }
        }
      } else {
        return log.error('No platforms to build. Check for vigour.native.platforms in your package.json')
      }
      return promise
    })
    .catch(function (reason) {
      log.error('oops', reason, reason.stack)
      throw reason
    })
}, config)

function builderFactory (platform, options) {
  return function () {
    return require(builders[platform])(options, shared)
  }
}

shared.copyAssets = function (opts) {
  // log.info("- copying assets -")
  // log.info("assest", opts.packer.assets)
  // log.info("to", opts.wwwDst)
  // log.info("working directory", opts.root)
  return fs.expandStars(opts.packer.assets, opts.root)
    .then(flatten)
    .then(function (resources) {
      var res
      var arr = []
      var dst
      var src
      // var p
      for (res in resources) {
        src = path.join(opts.root, res)
        dst = path.join(opts.wwwDst, res)
        log.info('Copying', src, 'to', dst)
        arr.push(cp(src, dst))
      }

      return Promise.all(arr)
    })
    .then(function () {
      return opts
    })
}

shared.handleErrors = function (platform) {
  return function (reason) {
    try {
      log.error(platform, reason, JSON.stringify(reason), reason.stack)
    } catch (e) {
      try {
        log.error(platform + ' (unstringifiable)', reason, reason.stack)
      } catch (e2) {
        log.error(platform + ' (no `e.stack`)', reason)
      }
    }
  }
}
