'use strict'
var Observable = require('vigour-js/lib/observable')
var Emitter = require('vigour-js/lib/emitter')
var emit = Emitter.prototype.emit

const INIT = 'init'

module.exports = new Observable({
  useVal: true,
  on: {
    parent: {
      platform () {
        var plugin = this.parent
        var createGetters = () => {
          plugin.each((property, key) => {
            this.define({
              [key]: {
                get () {
                  return this.parent[key]
                }
              }
            })
          })
        }
        plugin.on('property', [createGetters, this])
        createGetters()
      },
      error: {
        platform (data, event) {
          throw new Error(data)
        }
      }
    },
    properties: {
      init: new Emitter({
        define: {
          emit (data, event) {
            var plugin = this.parent.parent.parent
            var initialised = plugin.initialised
            if (!initialised.val) {
              // TODO add error handler => initialised is false
              plugin.initialised.origin.val = true
              plugin.loading.origin.val = INIT
              plugin.ready.is(true, function () {
                if (plugin.loading.val === INIT) {
                  plugin.loading.origin.val = false
                }
              })
              emit.apply(this, arguments)
            }
          }
        }
      })
    },
    ChildConstructor: new Emitter({
      define: {
        emit (data, event) {
          var platform = this.parent.parent
          var ready = platform.ready
          if (ready.val) {
            emit.apply(this, arguments)
          } else {
            ready.once([(ready, event) => {
              emit.call(this, data, event, platform)
            }, this])
            platform.emit(INIT, data, event)
          }
        }
      }
    })
  }
}).Constructor
