'use strict'

var log = require('npmlog')
var path = require('path')
var getChecksum = require('checksum')
var imgServer = require('shutter')
var Promise = require('promise')
var fs = require('vigour-fs/lib/server')
var exists = Promise.denodeify(fs.exists)
var readJSON = Promise.denodeify(fs.readJSON)
var readFile = Promise.denodeify(fs.readFile)
var writeJSON = Promise.denodeify(fs.writeJSON)

module.exports = exports = function () {
  var self = this
  log.info('- installing images -')

  var cacheFilename = path.join(this.buildDir, 'cache.js')

  return exists(cacheFilename)
    .then(function (exists) {
      if (exists) {
        return readJSON(cacheFilename)
      } else {
        return {}
      }
    })
    .then(function (cachedState) {
      // log.info('read image cache', cachedState)

      function upToDate (imPath) {
        return readFile(imPath)
          .then(getChecksum)
          .then(function (sum) {
            var isUpToDate = cachedState[imPath] === sum
            cachedState[imPath] = sum
            return isUpToDate
          })
      }

      var dstBase = path.join(self.srcDir, 'res')
      var manips = []
      var pending = []
      if (self.splashScreen) {
        var splashFileName = 'splash.png'
        var src = path.join(self.root, self.splashScreen)
        pending.push(upToDate(src)
          .then(function (isUpToDate) {
            if (isUpToDate) {
              log.info('skippin up to date image ' + self.splashScreen)
            } else {
              manips.push({
                src: src,
                batch: [{
                  dst: path.join(dstBase, 'drawable-xhdpi', splashFileName),
                  width: 960,
                  height: 960,
                  outType: 'png'
                }, {
                  dst: path.join(dstBase, 'drawable-large-xhdpi', splashFileName),
                  width: 2048,
                  height: 2048,
                  outType: 'png'
                }]
              })
            }
          }))
      }

      if (self.appIcon) {
        var iconFileName = 'ic_launcher.png'
        src = path.join(self.root, self.appIcon)
        pending.push(upToDate(src)
          .then(function (isUpToDate) {
            if (isUpToDate) {
              log.info('skippin up to date image ' + self.appIcon)
            } else {
              manips.push({
                src: path.join(self.root, self.appIcon),
                batch: [{
                  dst: path.join(dstBase, 'mipmap-mdpi', iconFileName),
                  width: 48,
                  height: 48,
                  outType: 'png'
                }, {
                  dst: path.join(dstBase, 'mipmap-hdpi', iconFileName),
                  width: 72,
                  height: 72,
                  outType: 'png'
                }, {
                  dst: path.join(dstBase, 'mipmap-xhdpi', iconFileName),
                  width: 96,
                  height: 96,
                  outType: 'png'
                }, {
                  dst: path.join(dstBase, 'mipmap-xxhdpi', iconFileName),
                  width: 144,
                  height: 144,
                  outType: 'png'
                } /*, {
                  dst: path.join(dstBase, 'mipmap-xxxhdpi', iconFileName),
                  width: 192,
                  height: 192
                }*/]
              })
            }
          }))
      }

      return Promise.all(pending)
        .then(function () {
          if (manips.length) {
            // log.info('installing images: ', JSON.stringify(manips))
            return imgServer({
              convertPath: 'forceUseOfRemote',
              manip: manips
            }).then(function () {
              return writeJSON(cacheFilename, cachedState)
            })
          }
        })
    })
}
