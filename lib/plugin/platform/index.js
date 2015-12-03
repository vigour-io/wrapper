'use strict'
var Observable = require('vigour-js/lib/observable')
var Emitter = require('vigour-js/lib/emitter')
var emit = Emitter.prototype.emit

const INIT = 'init'

exports.properties = {
  platform: new Observable({
    useVal: true,
    ready: {
      val: false,
      inject: require('vigour-js/lib/observable/is')
    },
    on: {
      error: {
        platform (data, event) {
          console.error('plugin error:', data)
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
                plugin.initialised.val = true
                plugin.loading.val = INIT
                plugin.ready.is(truthy, function isReady () {
                  plugin.ready.off(isReady)
                  if (plugin.loading.val === INIT) {
                    plugin.loading.val = false
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
              var emitter = this
              platform.emit(INIT, data, event)
              ready.is(truthy, function isReady (val, event) {
                ready.off(isReady)
                emit.call(emitter, data, event, platform)
              })
            }
          }
        }
      })
    }
  })
}

function truthy (val) {
  return !!val
}
