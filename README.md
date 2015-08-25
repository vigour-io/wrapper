# vigour-native

Builds a set of native apps from a single javascript codebase.

## Dependencies

- npm 2@ˆ2

## Install
- Add `git+ssh://git@github.com:vigour-io/vigour-native.git#master` to dependencies in package.json
- `npm i vigour-native --save` (Coming soon)


## Usage

Declaring vigour-native as a dependency to a project make an executable called vNative accessible. You can then build the project with `vNative build` or `vNative build -- <platform>` (see [supported platforms](#user-content-platforms)). Configuration is read from the project's package.json[`vigour.native`].

## Tests

Most of the tests expect to find the `vigour-example` repo in the same directory as `vigour-native`. If that is so, then `mocha test/` should do the rest. This of course should be improved eventually, either by making vigour-example a submodule, or by automating the cloning the first time tests are run, or perhaps even something entirely different...

## In-script usage

```
var vNative = require('vigour-native')
vNative.build({
  src: './src'
  , dest: './build'
  , splash: './img/splash.png'
  , platforms:
    {
      "web": true
      , "ios": {
        splash: {
          src: './img/splash-ios.png'
        }
      }
      , "android"
      , "wp8"
      , "chromecast"
      , "LG TV"
      , "Samsung TV"
      , "iWatch"
    }
  , plugins: [
    "https://github.com/vigour-io/vigour-native-statusBar#master"
    //, "vigour-native-statusBar" // Coming Soon: via npm
  ]
  , ignoreBuilds: true // Git only
}, function (err, meta) {
    console.log("Build done in " + meta.time "ms")
  })
```

**Also works with promises**
```
var vNative = require('vigour-native')
  , Promise = require('promise') // `npm i promise`
  , build = Promise.denodeify(vNative.build)
build({...})
.then(function (meta) {
  console.log("Build done in " + meta.time + "ms")
})
.catch(function (reason) {
  console.error(reason)
})
```

## Bridge

### ios

- app does
```javascript
bridge.send(pluginId, fnName, opts, cb)
```

- bridge does
```javascript
window
    .webkit
    .messageHandlers
    .vigourBridgeHandler
    .postMessage({ pluginId: 1,
      fnName: 'act',
      opts: {},
      cbId: 2
})
```
- native does its stuff, then calls
```javascript
window.vigour.native.bridgeResult(cbId, error)
```
  or
```javascript
window.vigour.native.bridgeResult(cbId, null, response)
```

with error being either an error as described below, or an array of them:
```javascript
{ message: "string",
  info: {}
}
```

### android

- app does
```javascript
bridge.send(pluginId, fnName, opts, cb)
```

- bridge does
```javascript
window
    .vigour
    .native
    .NativeInterface
    .send(
      JSON.stringify(
        { pluginId: 1,
          fnName: 'act',
          opts: {},
          cbId: 2
        }
      )
    )
```
- native does its stuff, then calls
```javascript
window.vigour.native.bridgeResult(cbId, error)
```
  or
```javascript
window.vigour.native.bridgeResult(cbId, null, response)
```

with error being either an error as described below, or an array of them:
```javascript
{ message: "string",
  info: {}
}
```

<a name='platforms'></a>
## Supported Platforms
  - [X] web browsers
  - [X] iOS
  - [X] android
  - [_] lg TV
  - [_] samsung TV
  - [_] chromecast
  - [_] iWatch
  - [_] windows phone
