var Promise = require('promise')
  , pliant = require('pliant')
  , log = require('npmlog')
  , fs = require('vigour-fs')
  , path = require('path')
  , flatten = require('vigour-js/util/flatten.js')
  , builders = {
    android: './android'
    , ios: './ios'
    , samsung: './samsungtv'
  }
  , _cp = Promise.denodeify(fs.cp)
  , shared = {}
  , config = require('./config')

module.exports = exports = pliant.fn(function (opts) {
  var options = opts.vigour
  var platform
  var promise = Promise.resolve()
  if (options.native.platforms)
  {
    for (platform in options.native.platforms) {
      if (options.native.platforms[platform]
        && (!options.native.selectedPlatforms || ~options.native.selectedPlatforms.indexOf(platform))
        && builders[platform]) {
        promise = promise.then(builderFactory(platform, options))
      }
    }
  } else {
    return console.error("No platforms to build. Check for vigour.native.platforms in your package.json")
  }
  return promise
}, config)

shared.copyAssets = function (opts) {
  log.info("- copying assets -")
  log.info("assest", opts.packer.assets)
  log.info("to", opts.wwwDst)
  log.info("working directory", opts.root)
  return fs.expandStars(opts.packer.assets, opts.root)
    .then(flatten)
    .then(function (resources) {
      var res
        , arr = []
        , dst
        , src
        , p
      for (res in resources) {
        src = path.join(opts.root, res)
        dst = path.join(opts.wwwDst, res)
        log.info("Copying", src, "to", dst)
        arr.push(_cp(src, dst))
      }

      return Promise.all(arr)
    })
    .then(function () {
      return opts
    })
}

builderFactory = function (platform, options) {
  return function () {
    return require(builders[platform])(options, shared)
  }
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