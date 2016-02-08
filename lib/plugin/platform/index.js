'use strict'
var Observable = require('vigour-js/lib/observable')
var Emitter = require('vigour-js/lib/emitter')
var emitInternal = Emitter.prototype.emitInternal

const INIT = 'init'

exports.properties = {
  _platform: new Observable({
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
            emitInternal (data, event) {
              console.log('[wrapper] [platform] ------> init emitInternal!')
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
                emitInternal.apply(this, arguments)
              }
            }
          }
        })
      },
      ChildConstructor: new Emitter({
        define: {
          emitInternal (data, event) {
            // console.log('[wrapper] [platform] ------> emitInternal!')
            var platform = this.parent.parent
            var ready = platform.ready
            if (ready.val) {
              // console.log('[wrapper] [platform] platform is ready! emitInternal!', platform.pluginId && platform.pluginId.val)
              // console.log('[wrapper] [platform] platform emitInternal data', data, 'on', this.path)
              emitInternal.apply(this, arguments)
              // console.log('[wrapper] [platform] did that apply lol')
            } else {
              // console.log('[wrapper] [platform] platform is not ready! emitInternal init, and when ready, emitInternal this.')
              var emitter = this
              platform.emit(INIT, data, event)
              ready.is(truthy, function isReady (val, event) {
                // console.log('[wrapper] [platform] platform is finally ready!', platform.pluginId && platform.pluginId.val)
                // console.log('[wrapper] [platform] platform emitInternal data', data)
                ready.off(isReady)
                emitInternal.call(emitter, data, event, platform)
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
