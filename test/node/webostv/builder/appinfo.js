'use strict'

var test = require('tape')
var proxyquire = require('proxyquire')
var sinon = require('sinon')
var fake = sinon.stub()
var readFileStub = sinon.stub()
var writeFileStub = sinon.stub()
var path = require('path')
var generateAppinfo
var templateDir = path.join(__dirname, '..', '..', '..', '..','templates', 'webostv')
var buildDir = path.join(__dirname + '../../../../app/build/lgtv/webos')
var fakeAppinfo = { "domain": "test", "appVersion": "1.0.0" }
var data = {
  'templateSrc':templateDir,
  'buildDir':buildDir,
  'appinfo':fakeAppinfo
}

test('Should generate the appinfo.json from the template and the passed data', (assert) => {
  var util = require('../../../../lib/util/index')
  var fs = require('vigour-fs-promised')
  var mustache = require('mustache')
  var callback = sinon.spy(util ,'transform_template')
  var outputCallback = sinon.spy(fs, 'writeFileAsync')
  var mustacheCallback = sinon.spy(mustache, 'render')

  assert.plan(4)

  generateAppinfo = require('../../../../lib/builder/webostv/generateAppinfo',{
    '../../util' : { transform_template: fake }
  })
  generateAppinfo.apply(data).then(() => {
    assert.equal(callback.callCount, 1, 'should be called just once')
    assert.equal(callback.firstCall.args[0], templateDir +'/appinfo.json' , 'should be called with the correct argument')
    assert.equal(outputCallback.callCount, 1, 'should generate just one output file')
    assert.equal(mustacheCallback.firstCall.args[1], fakeAppinfo, 'should call mustache render passing the correct params')
  })
})
