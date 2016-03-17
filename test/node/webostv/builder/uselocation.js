'use strict'

var test = require('tape')
var proxyquire = require('proxyquire')
var sinon = require('sinon')
var path = require('path')
var useLocation
var templateDir = path.join(__dirname + '/../../../../templates/webostv/appinfo.json')

var fs = require('vigour-fs-promised')

var resolveStub = sinon.stub(fs, 'readFileAsync' , () => {
   return Promise.resolve()
})

var fakeData = {
  location:true,
  wwwDst:'fake'
}

test('Use location', (assert) => {
  useLocation = proxyquire('../../../../lib/builder/uselocation', {
    'vigour-fs-promised': resolveStub
  })

  assert.plan(3)
  useLocation.apply(fakeData)
  assert.equal(resolveStub.firstCall.args[0], templateDir, 'should pass the folder root as 1st argument')
  assert.equal(resolveStub.firstCall.args[1], 'utf8', 'should pass the encoding as 2nd argument')

  fakeData.location = false
  resolveStub.reset()
  useLocation.apply(fakeData)
  assert.equal(resolveStub.callCount, 0, 'should not use the template html if location if not specified')

  assert.end()
})
