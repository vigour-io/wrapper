'use strit'
var path = require('path')
var Promise = require('promise')
var fs = require('vigour-fs-promised')
var nativeassets = require('../../../lib/builder/ios/nativeassets')
var base = path.join(__dirname, '..', '..', 'app')
var Shutter = require('vigour-shutter')

var mockBuilder = {
  buildDir: path.join(base, 'build'),
  splashScreen: path.join('assets', 'img', 'splash.png'),
  appIcon: path.join('assets', 'img', 'appIcon.png'),
  root: base
}
var splashPath = path.join(mockBuilder.buildDir,
  'vigour-native',
  'vigour-native',
  'Assets.xcassets',
  'LaunchImage.launchimage'
)
var iconsPath = path.join(mockBuilder.buildDir,
  'vigour-native',
  'vigour-native',
  'Assets.xcassets',
  'AppIcon.appiconset'
)
var handle

describe('nativeassets', function () {
  before(function () {
    return fs.removeAsync(mockBuilder.buildDir)
  })
  before(function () {
    return Promise.all([
      splashPath,
      iconsPath
    ].map(function (item) {
      return fs.mkdirpAsync(item)
    }))
  })
  before(function () {
    var shutter = new Shutter()
    return shutter.start()
      .then(function (_handle) {
        handle = _handle
      })
  })
  it('should succeed in under 30 seconds', function () {
    this.timeout(30000)
    return nativeassets.call(mockBuilder, 'localhost', 8000)
      .then(function () {
        var base = path.join(__dirname, '..', '..', '..', 'lib', 'builder', 'ios')
        var paths = [
          { pth: path.join(base, 'appicontpl.json'), name: 'icon', dstBase: iconsPath },
          { pth: path.join(base, 'launchimgtpl.json'), name: 'splash', dstBase: splashPath }
        ]
        return Promise.all(paths.map(function (item) {
          return fs.readJSONAsync(item.pth)
            .then(function (contents) {
              var l = contents.images.length
              var arr = []
              var fullPath
              for (var i = 1; i <= l; i += 1) {
                fullPath = path.join(item.dstBase, item.name + '-' + i + '.png')
                arr.push(fs.existsAsync(fullPath)
                  .then(function (exists) {
                    expect(exists).to.equal(true)
                  }))
              }
              arr.push(fs.existsAsync(path.join(item.dstBase, 'Contents.json')))
              return Promise.all(arr)
            })
        }))
      })
  })
  after(function (done) {
    handle.close(done)
  })
})
