'use strict'

var Config = require('vigour-config')
var log = require('npmlog')
var Promise = require('promise')
var fs = require('vigour-fs/lib/server')
var _keys = require('lodash/object/keys')
var _flatten = require('lodash/array/flatten')
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
  netcasttv: './lgnetcasttv',
  webostv: './webostv',
  chromecastweb: './chromecastweb',
  tizentv: './tizentv'
}

module.exports = exports = Builder

function Builder (config) {
  if (!(config instanceof Config)) {
    config = new Config(config)
  }
  this.config = config

  if (!this.config.native.root) {
    this.config.native.set({
      root: {
        val: process.cwd()
      }
    })
  }
}

Builder.prototype.start = function () {
  var self = this
  var pkgPath = path.join(this.config.native.root.val, 'package.json')
  return readJSON(pkgPath)
    .then(function (pkg) {
      var configuredPlatforms = (pkg.vigour && pkg.vigour.native && pkg.vigour.native.platforms)
        ? _keys(pkg.vigour.native.platforms)
        : []

      var config = self.config.plain()
      config.vigour = {
        native: config.native
      }

      delete config.native
      var options = new Base(config)
      options.set(pkg)
      var platforms = options.vigour.native.platforms.plain()
      var selected = options.vigour.native.selectedPlatforms.plain()

      var customPlatform = (options.vigour.native.customPlatform)
        ? options.vigour.native.customPlatform.plain()
        : false
      return searchDependencies(options.dependencies
        ? options.dependencies.plain()
        : false, options.vigour.native.root.val)
        .then(function (pluginPkgPaths) {
          return Promise.all(pluginPkgPaths.map(function (pkgRoot) {
            if (pkgRoot) {
              var pkgPath = path.join(pkgRoot, 'package.json')
              return readJSON(pkgPath)
                .then(function (pkg) {
                  if (pkg.vigour && pkg.vigour.plugin) {
                    pkg.vigour.plugin.name = pkg.name
                    pkg.vigour.plugin.rootPath = pkgRoot
                    return pkg.vigour.plugin
                  } else {
                    return false
                  }
                }, function (reason) {
                  return false
                })
            } else {
              return false
            }
          }))
        })
        .then(function (plugins) {
          var pluginsObj = {}
          plugins.map(function (entry) {
            if (entry) {
              pluginsObj[entry.name] = entry
              delete pluginsObj[entry.name].name
            }
          })
          options.vigour.native.set({
            plugins: pluginsObj
          })
          var promise = Promise.resolve()
          if (platforms) {
            var len = configuredPlatforms.length
            var platform
            var selectedFound = 0
            for (var i = 0; i < len; i += 1) {
              platform = configuredPlatforms[i]
              if (platforms[platform] &&
                (!selected || ~selected.indexOf(platform)) &&
                builders[platform]) {
                if (selected) {
                  selectedFound += 1
                }
                promise = promise.then(builderFactory(platform, options.plain()))
              }
            }
            if (selected === 'custom' && customPlatform) {
              selectedFound += 1
              promise = promise.then(function () {
                return customPlatform(options.plain())
              })
            }
            if (selectedFound === 0) {
              promise = promise.then(function () {
                var error = new Error('Invalid configuration')
                error.selectedPlatforms = selected
                error.msg = 'Please configure your target platforms in `vigour.native.platforms`'
                throw error
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
    })
}

function searchDependencies (dependencies, root) {
  if (!dependencies) {
    return Promise.resolve([])
  } else {
    var pluginPkgPath
    var pluginPkgPaths = []
    for (var key in dependencies) {
      pluginPkgPath = path.join(root, 'node_modules', key)
      pluginPkgPaths.push(pluginPkgPath)
    }
    return Promise.all(pluginPkgPaths.map(function (pkgRoot) {
      var pkgPath = path.join(pkgRoot, 'package.json')
      return readJSON(pkgPath)
        .then(function (pkg) {
          if (pkg.vigour && pkg.vigour.plugin) {
            return searchDependencies(pkg.dependencies, pkgRoot)
              .then(function (deps) {
                return searchDependencies(pkg.dependencies, root)
                  .then(function (otherDeps) {
                    return deps.concat(otherDeps)
                  })
              })
          } else {
            return false
          }
        })
        .catch(function (reason) {
          return false
        })
    }))
    .then(function (arr) {
      arr = _flatten(arr)
      return pluginPkgPaths.concat(arr.reduce(function (prev, curr) {
        if (curr) {
          prev.push(curr)
        }
        return prev
      }, []))
    })
  }
}

function builderFactory (platform, options) {
  return function () {
    var Plat = require(builders[platform])
    var plat = new Plat(options)
    return plat.build()
  }
}
