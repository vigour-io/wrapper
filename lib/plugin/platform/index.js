'use strict'
var Observable = require('vigour-js/lib/observable')
var Emitter = require('vigour-js/lib/emitter')
var emit = Emitter.prototype.emit

const INIT = 'init'

module.exports = new Observable({
  useVal: true,
  on: {
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
              emit.call(this, data, event)
            }, this])
            platform.emit(INIT, data, event)
          }
        }
      }
    })
  },
  define: {
    initialised: {
      get () {
        return this.parent.initialised
      }
    },
    loading: {
      get () {
        return this.parent.loading
      }
    },
    ready: {
      get () {
        return this.parent.ready
      }
    }
  }
}).Constructor
