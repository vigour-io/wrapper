#!/usr/bin/env node

var vNative = require('../../')
vNative.build({
  src: './lib'
  , dest: './build'
  , splash: './img/splash.png'
  , platforms:
    {
      web: true
      , ios: {
        splash: {
          src: './img/splash-ios.png'
        }
      }
      , android: true
      , wp8: true
      , chromecast: true
      , "LG TV": true
      , "Samsung TV": true
      , iWatch: true
    }
  , plugins: [
    "https://github.com/vigour-io/vigour-native-statusBar#master"
    //, "vigour-native-statusBar" // Coming Soon: via npm
  ]
  , ignoreBuilds: true // Git only
}, function (err, meta) {
    console.log("Build done in " + meta.time + "ms")
  })