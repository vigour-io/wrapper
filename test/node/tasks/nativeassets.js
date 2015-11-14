'use strit'
var path = require('path')
var Promise = require('promise')
var fs = require('vigour-fs-promised')
var nativeassets = require('../../../lib/builder/ios/nativeassets')
var base = path.join(__dirname, '..', '..', 'app')

var mockBuilder = {
  buildDir: path.join(base, 'build'),
  splashScreen: path.join('assets', 'img', 'splash.png'),
  appIcon: path.join('assets', 'img', 'appIcon.png'),
  root: base
}
var buiPath = path.join(base, 'bui')

describe('nativeassets', function () {
  before(function () {
    return fs.removeAsync(mockBuilder.buildDir)
  })
  before(function () {
    return fs.existsAsync(buiPath)
      .then(function (exists) {
        if (exists) {
          return fs.remove(buiPath)
        }
      })
  })
  before(function () {
    return Promise.all([
      path.join(mockBuilder.buildDir,
        'vigour-native',
        'vigour-native',
        'Assets.xcassets',
        'LaunchImage.launchimage'
      ),
      path.join(mockBuilder.buildDir,
        'vigour-native',
        'vigour-native',
        'Assets.xcassets',
        'AppIcon.appiconset'
      )
    ].map(function (item) {
      return fs.mkdirpAsync(item)
    }))
  })
  it("shouldn't create some weird `bui` file", function () {
    this.timeout(30000)
    return nativeassets.call(mockBuilder)
      .then(function () {
        return fs.existsAsync(buiPath)
          .then(function (exists) {
            expect(exists).to.equal(false)
          })
      })
  })
})
