var log = require('npmlog')
var path = require('path')
var fs = require('vigour-fs/lib/server')
var Promise = require('promise')
var imgServer = require('shutter')

module.exports = exports = function () {
  var self = this
  log.info('- Copying and resizing all the icons, It may take a while.. -')
  var images = JSON.stringify(this.xmlConfig.icons)
  var parsed = JSON.parse(images)
  var arr = []
  return new Promise(function (resolve, reject) {
    for (var file in parsed) {
      console.log('path', path.join(self.root, parsed[file]))
      if (fs.existsSync(path.join(self.root, parsed[file]))) {
        if (file === 'ThumbIcon') {
          arr.push({
            src: path.join(self.root, parsed[file]),
            dst: self.buildDir + '/icons/' + file + '.png',
            width: 106,
            height: 86,
            outType: 'png'
          })
        } else if (file === 'BigThumbIcon') {
          arr.push({
            src: path.join(self.root, parsed[file]),
            dst: self.buildDir + '/icons/' + file + '.png',
            width: 115,
            height: 95,
            outType: 'png'
          })
        } else if (file === 'ListIcon') {
          arr.push({
            src: path.join(self.root, parsed[file]),
            dst: self.buildDir + '/icons/' + file + '.png',
            width: 85,
            height: 70,
            outType: 'png'
          })
        } else if (file === 'BigListIcon') {
          arr.push({
            src: path.join(self.root, parsed[file]),
            dst: self.buildDir + '/icons/' + file + '.png',
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
    }
    imgServer({convertPath: 'forceUseOfRemote', manip: arr}).then(function () {
      resolve()
    })
  })
}
