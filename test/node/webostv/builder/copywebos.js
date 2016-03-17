'use strict'

var test = require('tape')
var proxyquire = require('proxyquire')
var sinon = require('sinon')
var path = require('path')
var templateDir = path.join(__dirname + '/../../../../templates/webostv/')
var buildDir = path.join(__dirname + '../../../../app/build/lgtv/webos/')
var copyWebOs
var fs = require('vigour-fs/lib/server')

var resolveStub = sinon.stub(fs, 'createReadStream' , () => {
   return Promise.resolve()
})

var fakeData = {
  "templateSrc" : templateDir,
  "buildDir" : buildDir,
  "builds" : true
}
test('Copying webostv file', (assert) => {
  copyWebOs = proxyquire('../../../../lib/builder/webostv/copywebos', {
    'vigour-fs/lib/server': resolveStub
  })
  assert.plan(1)
  copyWebOs.apply(fakeData)
  assert.equal(resolveStub.callCount,1,'should copy the webos file')
  assert.end()
})
