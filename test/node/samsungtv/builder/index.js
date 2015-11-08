'use strict'

var path = require('path')
var Builder = require('../../../../lib/builder')

// TODO Remove dependency on vigour-example being checkout-out in same directory as vigour-native, perhaps by making vigour-example a submodule?
var repo = path.join(__dirname, '..', '..', '..', 'app')
var pkgPath = path.join(repo, 'package.json')
var opts = {
  _packageDir: pkgPath,
  native: {
    root: repo
  }
}

var options = JSON.stringify(opts)
var timeout = 5 * 60 * 1000

describe('samsungtv build', function () {
  it('samsung Tv should succeed in under ' + timeout + ' milliseconds!'
  , function () {
    this.timeout(timeout)
    var _options = JSON.parse(options)
    var platform = 'samsungtv'
    _options.native.selectedPlatforms = platform
    var builder = new Builder(_options)
    return builder.start()
      .then(checkSuccess)
  })
})

function checkSuccess (success) {
  expect(success).to.equal(true)
}
