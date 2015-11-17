'use strict'

var path = require('path')
var Builder = require('../../../../lib/builder')

// TODO Remove dependency on vigour-example being checkout-out in same directory as vigour-native, perhaps by making vigour-example a submodule?
var repo = path.join(__dirname, '..', '..', '..', 'app')
var pkgPath = path.join(repo, 'package.json')
var opts = {
  _packageDir: pkgPath,
  vigour: {
    native: {
      root: repo
    }
  }
}

var options = JSON.stringify(opts)
var timeout = 5 * 60 * 1000

describe('webostv build', function () {
  it('webostv should succeed in under ' + timeout + ' milliseconds!'
  , function () {
    this.timeout(timeout)
    var _options = JSON.parse(options)
    var platform = 'webostv'
    _options.vigour.native.selectedPlatforms = platform
    var builder = new Builder(_options)
    console.log(_options,"bahhh")
    return builder.start()
      .then(checkSuccess)
  })
})

function checkSuccess (success) {
  expect(success).to.equal(true)
}
