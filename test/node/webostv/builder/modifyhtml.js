'use strict'

var test = require('tape')
var proxyquire = require('proxyquire')
var sinon = require('sinon')
var path = require('path')
var fs = require('vigour-fs-promised')
var modifyHtml
var rawHtml = "<!doctype html><html><head></head></html>"
var expetedHtml = "<!doctype html><html><head><script type='text/javascript' language='javascript' src='webos.js'></script></head></html>"
var buildDir = path.join(__dirname + '../../../../app/build/lgtv/webos/')
var returnedHtml
var fakeData = {
  buildDir:buildDir
}

var copyHtml = sinon.stub(fs, 'readFileAsync', (a) => {
  return Promise.resolve(rawHtml)
})

var abs = sinon.stub(fs, 'writeFileAsync', (path, html) => {
  returnedHtml = html
  assert.equals(abs.callCount, 1,'should output')
  return Promise.resolve()
})

test('Should call cleanUp just once',(assert) => {
  modifyHtml = proxyquire('../../../../lib/builder/webostv/modifyhtml', {
    'vigour-fs-promised': copyHtml
  })
  assert.plan(2)
  modifyHtml.apply(fakeData)
  assert.equals(copyHtml.callCount, 1,'should call modify html just once')
  assert.equals(abs.callCount, 1,'should output')
  assert.end()
})
