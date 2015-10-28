var log = require('npmlog')
var path = require('path')
var imgServer = require('shutter')
var Promise = require('promise')
var fs = require('vigour-fs/lib/server')
var readJSON = Promise.denodeify(fs.readJSON)
var writeJSON = Promise.denodeify(fs.writeJSON)

module.exports = exports = function () {
  var self = this
  log.info('- creating images -')

  var tplBase = path.join(__dirname, '..', '..', '..', 'lib', 'builder', 'ios')
  var xcodeAssetsPath = path.join(this.buildDir, 'vigour-native', 'vigour-native', 'Images.xcassets')

  var imgOpts = {
    convertPath: 'forceUseOfRemote',
    manip: []
  }

  var categories = [
    {
      tpl: 'launchImgTpl.json',
      dir: 'LaunchImage.launchimage',
      prefix: 'splash',
      src: this.splashScreen
    }, {
      tpl: 'appIconTpl.json',
      dir: 'AppIcon.appiconset',
      prefix: 'icon',
      src: this.appIcon
    }
  ]

  return Promise.all(
    categories.map(function (category) {
      if (category.src) {
        var obj = {
          src: path.join(self.root, category.src),
          batch: []
        }
        return readJSON(path.join(tplBase, category.tpl))
          .then(function (contents) {
            var i = 1
            var out = path.join(xcodeAssetsPath, category.dir)
            contents.images = contents.images.map(function (item) {
              item.filename = category.prefix + '-' + i + '.png'
              obj.batch.push({
                dst: path.join(out, item.filename),
                width: item.width,
                height: item.height,
                outType: 'png'
              })
              delete item.width
              delete item.height
              i += 1
              return item
            })
            return writeJSON(path.join(out, 'Contents.json'), contents, { mkdirp: true })
              .then(function () {
                if (obj.batch.length > 0) {
                  imgOpts.manip.push(obj)
                }
              })
          })
      }
    })
  ).then(function () {
    if (imgOpts.manip.length > 0) {
      return imgServer(imgOpts)
    }
  })
}
