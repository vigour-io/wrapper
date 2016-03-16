'use strict'

var test = require('tape')
var proxyquire = require('proxyquire')
var sinon = require('sinon')
var removeStub = sinon.stub()
var path = require('path')
var cleanUp
var buildDir = path.join(__dirname + '../../../../app/build/lgtv/webos/')

test('Should call cleanUp',function (assert) {
   cleanUp = proxyquire('../../../../lib/builder/cleanup', {
    'vigour-fs-promised': { removeAsync: removeStub }
  })

  cleanUp.apply({"buildDir":buildDir})
  assert.plan(2)

  assert.equal(removeStub.callCount, 1)
  assert.equal(removeStub.firstCall.args[0],buildDir)
  assert.end()
})
