var runTasks = require('../../../lib/builder/runTasks')
var Promise = require('promise')
var log = require('npmlog')

var builderStub = {
  platform: 'stub'
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
})
