/* global describe, it, expect */

var path = require('path')
var build = require('../../../../lib/build')

// TODO Remove dependency on vigour-example being checkout-out in same directory as vigour-native, perhaps by making vigour-example a submodule?
var repo = path.join(__dirname
  , '..', '..', '..', '..', '..', 'vigour-example')
var pkgPath = path.join(repo, 'package.json')
var opts =
{ configFiles: pkgPath,
  vigour: { native: {
      root: repo
    }
  }
}

var options = JSON.stringify(opts)
var timeout = 1200000

/*
TODO create these test:
- options result in gradle arguments (appId, version(Code))
- tree copy:
  - whole tree
  - don't overwrite
  - newer files
  - exclude stuff (build, .gradle, .idea)
- the template stuff:
  - reading file
  - writing file
  - inserting code at point
  - commenting line
- adding plugin leads to modifying build and java files
*/
describe('build', function () {
  it('android should succeed in under ' + timeout + ' milliseconds!'
    , function () {
      this.timeout(timeout)
      var _options = JSON.parse(options)
      var platform = 'android'
      _options.vigour.native.selectedPlatforms = platform
      return build(_options)
        .then(checkSuccess)
    })
})

function checkSuccess (success) {
  expect(success).to.equal(true)
}
