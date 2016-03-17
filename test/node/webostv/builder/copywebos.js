'use strict'

var test = require('tape')
var proxyquire = require('proxyquire')
var sinon = require('sinon')
var path = require('path')
var templateDir = path.join(__dirname + '/../../../../templates/webostv')
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

  assert.plan(3)
  copyWebOs.apply(fakeData)
  assert.equal(resolveStub.callCount,1, 'should copy the webos file')
  assert.equal(resolveStub.firstCall.args[0], templateDir+'/webos.js' , 'should pass the correct param')

  resolveStub.reset()
  fakeData.builds = false
  copyWebOs.apply(fakeData)
  assert.equal(resolveStub.callCount,0, 'should not copy the webos file')

  assert.end()
})
