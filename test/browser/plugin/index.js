'use strict'

var Plugin = require('../../../lib/plugin')
var Platform = require('../../../lib/plugin/platform')

describe('Working with Plugins', function () {

  var mock = new Platform({
    on: {
      init: {
        platform (data, event) {
          setTimeout(() => {
            this.ready.val = true
          }, 100)
        }
      },
      invert: {
        platform (data, event) {
          var type = typeof data
          if (type === 'string') {
            var string = this.lookUp(type)
            string.set(data.split('').reverse().join(''), event)
          }
        }
      }
    }
  })

  var inverterBoy = new Plugin({
    platform: mock,
    string: {
      on: {
        data (data, event) {
          this.platform.emit('invert', this.val, event)
        }
      }
    },
    array: {
      on: {
        data (data, event) {
          this.platform.emit('invert', data, event)
        }
      }
    }
  })

  it('set a string', function (done) {
    inverterBoy.string.val = 'helloworld'
    setTimeout(function () {
      expect(inverterBoy.string.val !== 'dlrowolleh').ok
      expect(inverterBoy.initialised.val === true).ok
      expect(inverterBoy.ready.val === false).ok
      expect(inverterBoy.loading.val).ok
    }, 10)
    setTimeout(function () {
      expect(inverterBoy.string.val === 'dlrowolleh').ok
      expect(inverterBoy.loading.val === false).ok
      expect(inverterBoy.ready.val === true).ok
      done()
    }, 150)
  })

  it('set another string', function () {
    inverterBoy.string.val = '123'
    expect(inverterBoy.string.val === '321').ok
  })

  it('set initialised to false => plugin needs to reinitialise', function (done) {
    inverterBoy.initialised.val = false
    inverterBoy.string.val = 'helloworld'
    setTimeout(function () {
      expect(inverterBoy.string.val !== 'dlrowolleh').ok
      expect(inverterBoy.initialised.val === true).ok
      expect(inverterBoy.ready.val === false).ok
      expect(inverterBoy.loading.val).ok
    }, 10)
    setTimeout(function () {
      expect(inverterBoy.string.val === 'dlrowolleh').ok
      expect(inverterBoy.loading.val === false).ok
      expect(inverterBoy.ready.val === true).ok
      done()
    }, 150)
  })
})
