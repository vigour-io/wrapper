'use strict'

var test = require('tape')
var proxyquire = require('proxyquire')
var sinon = require('sinon')
var createStub = sinon.stub()
var path = require('path')
var createStructure

test('Should call createStructure just once',function (assert) {
  var buildDir = path.join(__dirname + '../../../../app/build/lgtv/webos/')
  createStructure = proxyquire('../../../../lib/builder/webostv/createStructure', {
    'vigour-fs-promised': { mkdirp: createStub }
  })

  createStructure.apply({"buildDir":buildDir})

  assert.equal(createStub.callCount, 1)
  assert.end()

})

// // test('Should clean the folder',function (assert) {
// //   var folder
// //   var fs = require('fs')
// //   var buildDir = path.join(__dirname + '../../../../app/build/lgtv/webos/')
// //   cleanUp = require('../../../../lib/builder/cleanup')

// //   cleanUp.apply({"buildDir":buildDir})

// //   try {
// //     fs.lstatSync(buildDir).isDirectory()
// //   }
// //   catch (e) {
// //     assert.equal(e.code, 'ENOENT')
// //     assert.end()
// //   }
// // })
