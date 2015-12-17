'use strict'

var path = require('path')
var Promise = require('promise')
var fs = require('vigour-fs/lib/server')
var remove = Promise.denodeify(fs.remove)
var mkdir = Promise.denodeify(fs.mkdirp)
var ncp = require('ncp')
var _ncp = Promise.denodeify(ncp)
var log = require('npmlog')

module.exports = exports = function () {
  if (this.builds) {
    var self = this
    function createCopyFilter (src, dst) {
      return function (filename) {
        try {
          var relFilename = filename.substr(src.length)
          var stats = fs.statSync(filename)
          if (stats.isDirectory()) {
            if (filename.indexOf('.idea') >= 0 ||
              filename.indexOf('.gradle') >= 0 ||
              filename.indexOf('build') >= 0) {
              return false
            } else {
              return true
            }
          }

          var dstPath = path.join(dst, relFilename)
          if (!fs.existsSync(dstPath)) {
            log.info('   new: ' + relFilename)
            return true
          }
          var dstStats = fs.statSync(dstPath)
          // log.info('   ? ', relFilename, stats.mtime.getTime(), ' =? ', dstStats.mtime.getTime())
          if (stats.mtime.getTime() > dstStats.mtime.getTime()) {
            log.info('   updated: ' + relFilename)
            return true
          }
          if (relFilename.indexOf('MainActivity.java') > 0 ||
            relFilename.indexOf(path.join('app', 'build.gradle')) > 0 ||
            relFilename.indexOf('AndroidManifest.xml') > 0) {
            log.info('   force: ' + relFilename)
            return true
          }
          return false
        } catch (e) {
          log.info(e)
        }
      }
    }

    log.info('- copying android template -')

    log.info('  from', this.templateSrc)
    log.info('  to', this.buildDir)

    return (this.clean
      ? remove(this.buildDir)
      : Promise.resolve()
      )
      .then(function () {
        return mkdir(self.buildDir)
      })
      .then(function () {
        // TODO fix ncp
        return _ncp(self.templateSrc,
          self.buildDir,
          { clobber: true,
            filter: createCopyFilter(self.templateSrc, self.buildDir)
          })
      })
      // NOTE there is a bug in ncp regarding the filter and it's internal reference counter
      // ncp calls the callback too early and then the rest of our script can fail
      // so we wait 100 millis
      .then(function () {
        log.info('start waiting')
        return new Promise(function (resolve, reject) {
          // don't remove this code! see other comment!
          setTimeout(function () {
            // don't remove this code! see other comment!
            log.info('done waiting')
            resolve()
          }, 100)
        })
      })
      .then(function () {
        log.info('- copy done -')
      })
  } else {
    log.info('skipping installing template')
  }
}
