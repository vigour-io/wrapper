var log = require('npmlog')
var fs = require('vigour-fs/lib/server')
var nativeUtil = require('../../util')
var Promise = require('promise')

module.exports = exports = function () {
  var self = this
  log.info('- creating the html for samsung TV-')
  return new Promise(function (resolve, reject) {
    var file = fs.createReadStream(self.mainHtml).pipe(fs.createWriteStream(self.buildDir + '/index.html'))
    file.on('close', function () {
      nativeUtil.buildIndexHtml(self.buildDir + '/index.html', self.url)
      resolve()
    })
  })
}
