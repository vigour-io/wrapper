/* global describe, it, expect */

var path = require('path')
var builder = require('../../../../lib/builder')

// TODO Remove dependency on vigour-example being checkout-out in same directory as vigour-native, perhaps by making vigour-example a submodule?
var repo = path.join(__dirname
  , '..', '..', '..', '..', '..', 'vigour-example')
var pkgPath = path.join(repo, 'package.json')
var opts =
  { configFiles: pkgPath,
  vigour:
    { native:
      {
        root: repo
      }
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
    _options.vigour.native.selectedPlatforms = platform
    return builder(_options)
      .then(checkSuccess)
  })
})

function checkSuccess (success) {
  expect(success).to.equal(true)
}
