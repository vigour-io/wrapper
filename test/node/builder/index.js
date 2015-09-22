/* global describe, it, expect */

var builder = require('../../../lib/builder/')

describe('builder', function () {
  it('should pass options and the shared object to platform builders', function () {
    return builder({
      vigour: {
        native: {
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
    })
  })
})
