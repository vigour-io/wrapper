'use strict'

var test = require('tape')
var proxyquire = require('proxyquire')
var sinon = require('sinon')
var path = require('path')
var resolveStub = sinon.stub()
var copyAsset
var stubData = {
  assets:false,
  root:'fakePath'
}

test('Copying assets', (assert) => {
  copyAsset = proxyquire('../../../../lib/builder/copyassets', {
    'vigour-fs/lib/server': { expandStars: resolveStub }
  })
  assert.plan(3)
  copyAsset.apply(stubData)
  assert.equal(resolveStub.callCount, 0, 'should not copy the assets if not specified')

  stubData.assets = true
  copyAsset.apply(stubData)
  assert.equal(resolveStub.firstCall.args[1], 'fakePath', 'should pass the folder root')
  assert.equal(resolveStub.callCount, 1, 'should copy the assets if specified')
  assert.end()
})
