var path = require('path')
var builder = require('../../../lib/builder/')

var root = path.join(__dirname, '..', '..', 'app')
var config = {
  vigour: {
    native: {
      root: root,
      selectedPlatforms: 'custom',
      customPlatform: function (opts, shared) {
        console.log(typeof shared, shared)
        expect(opts).to.be.an.object
        expect(shared).to.be.an('object')
        expect(shared.copyAssets).to.be.a('function')
        expect(shared.handleErrors).to.be.a('function')
      }
    }
  }
}

describe('builder', function () {
  it('should pass options and the shared object to platform builders', function () {
    return builder(config)
  })
})
