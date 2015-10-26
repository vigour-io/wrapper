var Promise = require('promise')
var pliant = require('pliant')
var log = require('npmlog')
var fs = require('vigour-fs/lib/server')
var path = require('path')
var Base = require('vjs/lib/base')
Base.prototype.inject(
  require('vjs/lib/methods/plain')
)
var readJSON = Promise.denodeify(fs.readJSON)
var config = require('./config')
var builders = {
  android: './android',
  ios: './ios',
  samsungtv: './samsungtv'
}

module.exports = exports = pliant.fn(config, function (opts) {
  if (opts.vigour.native.root) {
    return readJSON(path.join(opts.vigour.native.root, 'package.json'))
      .then(function (pkg) {
        var merge = new Base(opts)
        merge.set(pkg)
        var converted = merge.plain()
        return nextStep(converted)
      })
  } else {
    return nextStep(opts)
  }
})

function nextStep (opts) {
  var options = opts
  // log.info('options', JSON.stringify(options, null, 2))
  var platforms = options.vigour.native.platforms
  var selected = options.vigour.native.selectedPlatforms
  var customPlatform = options.vigour.native.customPlatform
  var platform

  var pluginPkgPaths = []
  var pluginPkgPath
  for (var key in opts.dependencies) {
    pluginPkgPath = path.join(options.vigour.native.root, 'node_modules', key, 'package.json')
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
      options.vigour.native.plugins = plugins
      var promise = Promise.resolve()
      if (platforms) {
        for (platform in options.vigour.native.platforms) {
          if (platforms[platform] &&
            (!selected || ~selected.indexOf(platform)) &&
            builders[platform]) {
            promise = promise.then(builderFactory(platform, options))
          }
        }
        if (selected === 'custom' && customPlatform) {
          promise = promise.then(function () {
            return customPlatform(options)
          })
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
}

function builderFactory (platform, options) {
  return function () {
    var Plat = require(builders[platform])
    var plat = new Plat(options)
    return plat.build()
  }
}
