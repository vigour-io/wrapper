var Promise = require('promise')
  , log = require('npmlog')
  , fs = require('vigour-fs')
  , path = require('path')
  , flatten = require('vigour-js/util/flatten.js')
  , builders = {
    android: './android'
    , ios: './ios'
  }
  , _cp = Promise.denodeify(fs.cp)
  , shared = {}

module.exports = exports = function (options, cb) {
  var startTime = Date.now()
    , p = Promise.resolve()
    , platform
  if (options.platforms)
  {
    for (platform in options.platforms) {
      if (options.platforms[platform] && builders[platform]) {
        p = p.then(builderFactory(platform, options))
      }
    }
  } else {
    return console.error("No platforms to build. Check for vigour.native.platforms in your package.json")
  }
  p = p.then(function () {
    var endTime = Date.now()
      , o =
      {
        time: endTime - startTime
      }
    return o
  })
  if (cb) {
    p = p.then(function (val) {
      cb(null, val)
    }, cb)
  }
  return p
}

shared.copyAssets = function (opts) {
  log.info("- copying assets -")
  log.info("assest", opts.packer.assets)
  log.info("to", opts.wwwDst)
  log.info("working directory", opts.cwd)
  return fs.expandStars(opts.packer.assets, opts.cwd)
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