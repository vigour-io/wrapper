'use strict'

var log = require('npmlog')
var path = require('path')
var fs = require('vigour-fs-promised')
var Promise = require('promise')
var Shutter = require('vigour-shutter')

module.exports = exports = function () {
  log.info('- Copying and resizing all the icons, It may take a while.. -')
  if (!this.icons) {
    log.warn('No icons declared for TizenTV')
    return Promise.resolve()
  }
  var images = JSON.stringify(this.icons)
  var parsed = JSON.parse(images)
  var arr = []
  var proms = []
  for (var file in parsed) {
    proms.push(fs.existsAsync(path.join(this.root, parsed[file]))
      .then((exists) => {
        if (exists) {
          if (file === 'ThumbIcon') {
            arr.push({
              src: path.join(this.root, parsed[file]),
              dst: this.buildDir + '/icons/' + file + '.png',
              width: 106,
              height: 86,
              outType: 'png'
            })
          } else if (file === 'BigThumbIcon') {
            arr.push({
              src: path.join(this.root, parsed[file]),
              dst: this.buildDir + '/icons/' + file + '.png',
              width: 115,
              height: 95,
              outType: 'png'
            })
          } else if (file === 'ListIcon') {
            arr.push({
              src: path.join(this.root, parsed[file]),
              dst: this.buildDir + '/icons/' + file + '.png',
              width: 85,
              height: 70,
              outType: 'png'
            })
          } else if (file === 'BigListIcon') {
            arr.push({
              src: path.join(this.root, parsed[file]),
              dst: this.buildDir + '/icons/' + file + '.png',
              width: 95,
              height: 78,
              outType: 'png'
            })
          }
        } else {
          var error = new Error('ENOTFOUND')
          error.info = {
            file: parsed[file]
          }
          throw error
        }
      })
    )
  }
  return Promise.all(proms)
    .then(() => {
      var imgServer = new Shutter({convertPath: 'forceUseOfRemote', manip: arr})
      return imgServer.start()
    })
}
