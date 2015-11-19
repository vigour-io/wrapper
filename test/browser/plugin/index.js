'use strict'

// we need to mock all behaviour for tests here
// also we need to use correct error handling from the bridge
describe('Plugin', function () {
  var Plugin = require('../../../lib/bridge/plugin')
  var example = new Plugin({
    key: 'example',
    display: {}
  })
  it('should not crash', function () {
    expect(example).to.be.ok
  })
})
