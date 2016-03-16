'use strict'

var path = require('path')
var log = require('npmlog')
var Promise = require('promise')
var fs = require('vigour-fs/lib/server')
var cp = Promise.denodeify(fs.cp)
var flatten = require('vigour-util/flatten.js')

/* copyAssets
  allows settings in package.json to specify what files should be included in the
  wrapped app e.g. { images: '*', assets: { fonts: '*' } }
*/

function copyAssets (assets, name) {
  return new Promise((resolve, reject) => {
    if (!assets) {
      return resolve()
    }
    // log.info('assets', assets)
    // log.info('root', this.root)
    resolve(fs.expandStars(assets, this.root)
      .then((val) => {
        // log.info('val', val)
        return flatten(val, '/')
      })
      .then((resources) => {
        // log.info('resources', resources)
        var res
        var arr = []
        var dst
        var src
        // var p
        for (res in resources) {
          src = path.join(this.root, res)
          dst = (name === 'assets')
            ? path.join(this.wwwDst, res)
            : path.join(this.externalAssetsDir, res)
          // if (this.debug && res === 'build.js') {
          // src = path.join(this.root, 'bundle.js')
          // }
          log.info('copying', src, 'to', dst)
          arr.push(cp(src, dst, { mkdirp: true }))
        }
        return Promise.all(arr)
      }))
  })
}

module.exports = exports = function () {
  log.info('- copying assets -')
  return copyAssets.call(this, this.assets, 'assets')
    .then(() => {
      if (this.opts.doExternalAssets) {
        return copyAssets.call(this, this.externalAssets, 'externalAssets')
      } else {
        log.info('- skipping external assets -')
      }
    })
}
