var runTasks = require('../../../lib/builder/runTasks')
var copyAssets = require('../../../lib/builder/copyAssets')
var Promise = require('promise')
var log = require('npmlog')
var path = require('path')
var fs = require('vigour-fs-promised')
var _cloneDeep = require('lodash/lang/cloneDeep')

var builderStub = {
  platform: 'stub',
  assets: {
    'base.js': true,
    'index.js': true
  },
  root: __dirname,
  wwwDst: path.join(__dirname, 'www')
}

describe('base', function () {
  describe('runTasks', function () {
    it('should execute all tasks in order', function () {
      var spyOneRan = false
      var spyTwoRan = false

      var spyOne = sinon.spy(function () {
        return new Promise(function (resolve, reject) {
          expect(spyTwoRan).to.equal(false)
          spyOneRan = true
          setTimeout(function () {
            resolve()
          }, 100)
        })
      })
      var spyTwo = sinon.spy(function () {
        expect(spyOneRan).to.equal(true)
        spyTwoRan = true
      })
      var tasks = [
        spyOne,
        spyTwo
      ]
      return runTasks.call(builderStub, tasks)
        .then(function () {
          expect(spyOne).calledOnce
          expect(spyTwo).calledOnce
        })
    })

    it('should log and rethrow errors', function () {
      var logSpy = sinon.spy(log, 'error')
      var tasks = [
        function () {
          log.info('next', 'expect an error to be logged')
          throw new Error('Stub')
        }
      ]
      return runTasks.call(builderStub, tasks)
        .catch(function (reason) {
          expect(reason.message).to.equal('Stub')
        })
        .then(function () {
          expect(logSpy).calledOnce
        })
    })
  })

  describe('copyAssets', function () {
    describe('correct usage', function () {
      it('should copy all declared assets to the declared destination', function () {
        return copyAssets.call(builderStub)
          .then(function () {
            return checkExistance([
              path.join(builderStub.wwwDst, 'base.js'),
              path.join(builderStub.wwwDst, 'index.js')
            ])
          })
      })
      after(function () {
        return fs.removeAsync(builderStub.wwwDst)
      })
    })
    describe('wrong usage', function () {
      var thenSpy = sinon.spy()
      it('should succeed if `assets` is empty', function () {
        var builderStub_emptyAssets = _cloneDeep(builderStub)
        builderStub_emptyAssets.assets = {}
        return copyAssets.call(builderStub_emptyAssets)
          .then(thenSpy)
      })
      it('should throw a useful error if no assets are specified', function () {
        var builderStub_noAssets = _cloneDeep(builderStub)
        delete builderStub_noAssets.assets
        return copyAssets.call(builderStub_noAssets)
          .then(thenSpy, function (reason) {
            expect(reason.message).to.equal('Invalid configuration')
            expect(reason.info).to.equal('Missing `vigour.native.platforms.<platform>.assets`')
          })
      })
      after(function () {
        expect(thenSpy).calledOnce
      })
    })
  })
})

function checkExistance (items) {
  return Promise.all(items.map(function (item) {
    return fs.existsAsync(item)
      .then(function (exists) {
        expect(exists).to.equal(true)
      })
  }))
}
