'use strict'

var test = require('tape')
var proxyquire = require('proxyquire')
var sinon = require('sinon')
var removeStub = sinon.stub()
var path = require('path')
var cleanUp

test('Should call cleanUp just once',function (assert) {
   cleanUp = proxyquire('../../../../lib/builder/cleanup', {
    'vigour-fs-promised': { removeAsync: removeStub }
  })

  cleanUp.apply({"buildDir":"teste"})

  assert.equal(removeStub.callCount, 1)
  assert.end()
})

test('Should clean the folder',function (assert) {
  var folder
  var fs = require('fs')
  var buildDir = path.join(__dirname + '../../../../app/build/lgtv/webos/')
  cleanUp = require('../../../../lib/builder/cleanup')

  cleanUp.apply({"buildDir":buildDir})

  try {
    fs.lstatSync(buildDir).isDirectory()
  }
  catch (e) {
    assert.equal(e.code, 'ENOENT')
    assert.end()
  }
})
