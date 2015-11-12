var Plugin = require('../lib/bridge/plugin')

var devBridge = require('../lib/bridge')
//

var devNativePlugins = {
  ChromeCast: {
    init() {
      console.log('FAKE NATIVE INIT FUNCTION!--------')
      // err, response, pluginId

      window.vigour.native.bridge.ready(null, true,'ChromeCast')

      setTimeout(function(){
        window.vigour.native.bridge.receive(null, {joined: {id: 'asdf23'}}, 'ChromeCast')
      }, 1000)

    }
  }
}

devBridge.send = function (pluginId, fnName, opts, cb) {
  console.log('haha im sending!', arguments)
  devNativePlugins[pluginId][fnName](opts, cb)
}

// devBridge.registerPlugin = function () {
//   console.log('what?')
// }

var ChromeCast = new Plugin({
  key: 'ChromeCast',
  on: {
    new: {
      ChromeCastPlugin () {
        this.bridge.send('ChromeCast', 'init')
      }
    },
    receive (msg) {
      console.log('wut got a msg!', msg)
      if(msg.joined){
        console.log('something joined!!', msg)
      } else if(msg.left) {

      }
    },
    deviceJoined (device) {
      console.log('device joined!', device)
    },
    deviceLeft (device) {
      console.log('device left!', device)
    }
  },
  define: {
    scanForDevices () {
      this.bridge.send('scanForDevices')
    },
    // bridge: devBridge
  },
  bridge: {
    useVal: devBridge
  }
}).Constructor

var chr = new ChromeCast()
// chr.scanForDevices()
//
// devBridge.receive(null, 'MESSAGE', 'ChromeCast')
