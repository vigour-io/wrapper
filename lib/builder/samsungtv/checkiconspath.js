'use strict'

var log = require('npmlog')
var path = require('path')
var fs = require('vigour-fs/lib/server')
var Promise = require('promise')
var Shutter = require('vigour-shutter')

module.exports = exports = function () {
  if (this.builds) {
    log.info('- Copying and resizing all the icons, It may take a while.. -')
    var images = JSON.stringify(this.icons)
    var parsed = JSON.parse(images)
    var arr = []
    var proms = []
    for (var file in parsed) {
      console.log('path', path.join(this.root, parsed[file]))
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
        }))
    }
    return Promise.all(proms)
      .then(() => {
        var imgServer = new Shutter({convertPath: 'forceUseOfRemote', manip: arr})
        return imgServer.start()
      })
  } else {
    log.info('- Skipping copying and resizing all the icons -')
  }
}
