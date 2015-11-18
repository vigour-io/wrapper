'use strict'

var Config = require('vigour-js/lib/config')
var log = require('npmlog')
var Promise = require('promise')
var fs = require('vigour-fs/lib/server')
var path = require('path')
var Base = require('vigour-js/lib/base')
Base.prototype.inject(
  require('vigour-js/lib/methods/plain')
)
var readJSON = Promise.denodeify(fs.readJSON)

var builders = {
  web: './web',
  android: './android',
  ios: './ios',
  samsungtv: './samsungtv',
  chromecastweb: './chromecastweb',
}

module.exports = exports = Builder

function Builder (config) {
  if (!(config instanceof Config)) {
    config = new Config(config)
  }
  this.config = config

  if (!this.config.native.root) {
    this.config.native.root = {
      val: process.cwd()
    }
  }
}

Builder.prototype.start = function () {
  var self = this
  if (this.config.native.root.val) {
    var pkgPath = path.join(this.config.native.root.val, 'package.json')
    return readJSON(pkgPath)
      .then(function (pkg) {
        var config = self.config.plain()
        config.vigour = {
          native: config.native
        }
        delete config.native
        var merge = new Base(config)
        merge.set(pkg)
        var converted = merge.plain()
        return self.nextStep(converted)
      })
  } else {
    return self.nextStep(self.config.plain())
  }
}

Builder.prototype.nextStep = function (opts) {
  var options = opts
  // log.info('options', JSON.stringify(options, null, 2))
  var platforms = options.vigour.native.platforms
  var selected = options.vigour.native.selectedPlatforms
  var customPlatform = options.vigour.native.customPlatform
  var platform

  var pluginPkgPaths = []
  var pluginPkgPath
  for (var key in options.dependencies) {
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
        return log.error('No platforms to build. Check for native.platforms in your package.json')
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
