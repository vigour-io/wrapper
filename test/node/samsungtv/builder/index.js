'use strict'

var path = require('path')
var Builder = require('../../../../lib/builder')

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

describe('samsungtv build', function () {
  it('samsung Tv should succeed in under ' + timeout + ' milliseconds!'
  , function () {
    this.timeout(timeout)
    var _options = JSON.parse(options)
    var platform = 'samsungtv'
    _options.vigour.native.selectedPlatforms = platform
    var builder = new Builder(_options)
    return builder.start()
      .then(checkSuccess)
  })
})

function checkSuccess (success) {
  expect(success).to.equal(true)
}
