'use strict'

var Plugin = require('vigour-wrapper-bridge/lib/plugin')
var bridgeInject = require('vigour-wrapper-bridge/lib/plugin/injection')
var bridge = require('vigour-wrapper-bridge')

describe('Working with Plugins: InverterBoy', function () {
  var inverterBoy = new Plugin({
    _platform: {
      on: {
        init: {
          mock (data, event) {
            setTimeout(() => {
              this.parent.ready.val = true
            }, 100)
          }
        },
        invert: {
          mock (data, event) {
            var type = typeof data
            if (type === 'string') {
              var string = this.lookUp(type)
              string.set(data.split('').reverse().join(''), event)
            }
          }
        }
      }
    },
    string: {
      on: {
        data (data, event) {
          this._platform.emit('invert', this.val, event)
        }
      }
    }
  })

  it('set a string', function (done) {
    inverterBoy.string.val = 'helloworld'
    expect(inverterBoy.string.val).equals('helloworld')
    expect(inverterBoy.initialised.val === true).ok
    expect(inverterBoy.ready.val === false).ok
    expect(inverterBoy.loading.val).ok

    inverterBoy.string.once(function (data) {
      expect(inverterBoy.string.val === 'dlrowolleh').ok
      expect(inverterBoy.loading.val).to.be.false
      expect(inverterBoy.ready.val).to.be.true
      done()
    })
  })

  it.skip('set another string', function () {
    inverterBoy.string.val = '123'
    expect(inverterBoy.string.val).to.equal('321')
  })

  it('set initialised to false => plugin needs to reinitialise', function (done) {
    inverterBoy.initialised.val = false
    inverterBoy.string.val = 'helloworld'
    expect(inverterBoy.string.val !== 'dlrowolleh').ok
    expect(inverterBoy.initialised.val === true).ok
    expect(inverterBoy.ready.val === false).ok
    expect(inverterBoy.loading.val).ok

    inverterBoy.string.once(function (data) {
      expect(inverterBoy.string.val === 'dlrowolleh').ok
      expect(inverterBoy.loading.val).to.be.false
      expect(inverterBoy.ready.val).to.be.true
      done()
    })
  })
})

describe('Working with Plugins: Social', function () {
  console.clear()
  var social = new Plugin({
    _platform: {
      inject: bridgeInject('vigour-testing'),
      on: {
        init: {
          mock (data, event) {
            setTimeout(() => {
              this.parent.ready.val = true
            }, 20)
          }
        },
        login: {
          mock (data, event) {
            this.parent.loading.val = 'login'
            setTimeout(() => {
              this.parent.loggedin.val = true
              if (this.parent.loading.val === 'login') {
                this.parent.loading.val = false
              }
            }, 10)
          }
        },
        logout: {
          mock (data, event) {
            this.parent.loading.val = 'logout'
            setTimeout(() => {
              this.parent.loggedin.val = false
              if (this.parent.loading.val === 'logout') {
                this.parent.loading.val = false
              }
            }, 5)
          }
        }
      }
    },
    loggedin: false,
    user: {
      on: {
        data (data, event) {
          if (this.val) {
            this._platform.emit('login', this.val, event)
          } else {
            this._platform.emit('logout', this.val, event)
          }
        }
      }
    }
  })

  it('should be connected to the bridge', function () {
    expect(bridge.plugins.testing).to.equal(social._platform)
  })

  it('set a user => initialised api and logs in', function (done) {
    social.user.val = true
    setTimeout(function () {
      expect(social.loggedin.val === false).ok
      expect(social.initialised.val === true).ok
      expect(social.ready.val === false).ok
      expect(social.loading.val).ok
    }, 10)
    setTimeout(function () {
      expect(social.loggedin.val === true).ok
      expect(social.loading.val === false).ok
      expect(social.ready.val === true).ok
      done()
    }, 150)
  })
})
