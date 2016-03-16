'use strict'

var test = require('tape')
var proxyquire = require('proxyquire')
var sinon = require('sinon')
var createStub = sinon.stub()
var path = require('path')
var createStructure

test('Should call createStructure',(assert) => {
  var buildDir = path.join(__dirname + '../../../../app/build/lgtv/webos/')
  createStructure = proxyquire('../../../../lib/builder/webostv/createStructure', {
    'vigour-fs-promised': { mkdirp: createStub }
  })
  createStructure.apply({"buildDir":buildDir})

  assert.plan(2)
  assert.equal(createStub.callCount, 1)
  assert.equal(createStub.firstCall.args[0],buildDir)
  assert.end()
})
