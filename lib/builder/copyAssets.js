var path = require('path')
var log = require('npmlog')
var Promise = require('promise')
var fs = require('vigour-fs/lib/server')
var cp = Promise.denodeify(fs.cp)
var flatten = require('vjs/lib/util/flatten.js')

module.exports = exports = function () {
  log.info('- copying assets -')
  var self = this
  // log.info('assest', self.packer.assets)
  // log.info('to', self.wwwDst)
  // log.info('working directory', self.root)
  return fs.expandStars(self.assets, self.root)
    .then(function (val) {
      return flatten(val, '/')
    })
    .then(function (resources) {
      var res
      var arr = []
      var dst
      var src
      // var p
      for (res in resources) {
        src = path.join(self.root, res)
        dst = path.join(self.wwwDst, res)
        // if (self.debug && res === 'build.js') {
        // src = path.join(self.root, 'bundle.js')
        // }
        log.info('copying', src, 'to', dst)
        arr.push(cp(src, dst, { mkdirp: true }))
      }

      return Promise.all(arr)
    })
}
