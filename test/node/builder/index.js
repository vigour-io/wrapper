'use strict'

var path = require('path')
var Builder = require('../../../lib/builder/')

var root = path.join(__dirname, '..', '..', 'app')
var config = {
  vigour: {
    native: {
      root: root,
      selectedPlatforms: 'custom',
      customPlatform: function (opts) {
        expect(opts).to.be.an.object
        expect(opts.vigour.native.plugins[0].name).to.equal('vigour-plugin')
      }
    }
  }
}

describe('builder', function () {
  it('should pass options and the shared object to platform builders', function () {
    var builder = new Builder(config)
    return builder.start()
  })
})
