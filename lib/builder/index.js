'use strict'

var Config = require('vigour-config')
var log = require('npmlog')
var Promise = require('promise')
var fs = require('vigour-fs/lib/server')
var _keys = require('lodash.keys')
var _flatten = require('lodash.flatten')
var path = require('path')
var Base = require('vigour-base')
Base.prototype.inject(
  require('vigour-base/lib/method/plain')
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

/*
  Builder (Wrapper) class to wrap for targeted platforms
*/
function Builder (config) {
  if (!(config instanceof Config)) {
    config = new Config(config)
  }
  this.config = config
  // TODO: check for root.val
  if (!this.config.native.root) {
    // TODO: simplify this set
    this.config.native.set({
      root: {
        val: process.cwd()
      }
    })
  }
}

/*
  Builder.start()
  checks
    - list of platforms configured for this project
    - list of platforms it is told to wrap for from the arguments of the constructor
*/
Builder.prototype.start = function () {
  var self = this
  var pkgPath = path.join(this.config.native.root.val, 'package.json')
  /* read package.json from project root*/
  return readJSON(pkgPath)
    .then(function (pkg) {
      /* list of configured platforms */
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
      /* platforms: everything configured on project level */
      var platforms = options.vigour.native.platforms.plain()
      /* selected: what should be wrapped from list of platforms*/
      var selected = options.vigour.native.selectedPlatforms.plain()
      /* customPlatform: way to inject custom platorm at wrap time */
      var customPlatform = (options.vigour.native.customPlatform)
        ? options.vigour.native.customPlatform.plain()
        : false
      var buildLaunched = 0
      /* searchDependencies
        searches dependencies of the project for wrapper plugins that have wrapper
        config in their package.json and reads those to add them to the total config.
      */
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
          /* start with resolve so that its always a promise */
          var promise = Promise.resolve()
          if (platforms) {
            var len = configuredPlatforms.length
            var platform
            /* start iterating over configured platforms */
            for (var i = 0; i < len; i += 1) {
              platform = configuredPlatforms[i]
              if (platforms[platform] &&
                (!selected || ~selected.indexOf(platform)) &&
                builders[platform]) {
                /* actually wrap for this platform! */
                buildLaunched += 1
                promise = promise.then(builderFactory(platform, options.plain()))
              }
            }
            if (selected === 'custom' && customPlatform) {
              /* if customplatform is there then pop dat */
              console.log('custom')
              buildLaunched += 1
              promise = promise.then(function () {
                return customPlatform(options.plain())
              })
            }
          } else {
            return log.error('No platforms to build. Check for native.platforms in your package.json')
          }
          return promise
        })
        .then(function (val) {
          /* check if we're actaully wrapping for at least 1 platform  */
          if (buildLaunched === 0) {
            var error = new Error('Invalid configuration')
            error.selectedPlatforms = selected
            error.msg = 'Please configure your target platforms in `vigour.native.platforms`'
            throw error
          }
          return val
        })
        .catch(function (reason) {
          log.error('oops', reason, reason.stack)
          throw reason
        })
    })
}
/* searchDependencies
  gather info on dependencies and nested dependencies, search for
  package.vigour.plugin info
*/
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
    /* require platform builder/wrapper and call build */
    var Plat = require(builders[platform])
    var plat = new Plat(options)
    return plat.build()
  }
}
