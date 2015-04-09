var Promise = require('promise')
  , builders = {
    android: require('./android')
    , ios: require('./ios')  
  }

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
    throw new Error("No platforms to build")
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

builderFactory = function (platform, options) {
  return function () {
    return builders[platform](options)
  }
}