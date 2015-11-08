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
    .NativeInterface
    .send(
      JSON.stringify(
        [ cbId,
          pluginId,
          fnName,
          opts
        ]
      )
    )
```
- native does its stuff, then calls
```javascript
window.vigour.native.bridge.result(cbId, error)
```
  or
```javascript
window.vigour.native.bridge.result(cbId, null, response)
```

with error being either an error as described below, or an array of them:
```javascript
{ message: "string",
  info: {}
}
```

## native
### Android

The native code for android is devided in two projects, both found in [templates/android](templates/android):
- `app`: the code for the app that contains the WebView that will display the javascript app
- `plugincore`: the library of base classes needed for both plugins and the app.

The plugin-core library is released to JCenter and can be added as dependency with the following code:
```gradle
compile 'io.vigour:plugin-core:0.4.1'
```
The current version of the plugincore is [ ![Download](https://api.bintray.com/packages/vigour/maven/plugin-core/images/download.svg) ](https://bintray.com/vigour/maven/plugin-core/_latestVersion)

<a name='platforms'></a>
## Supported Platforms
  - [X] web browsers
  - [X] iOS
  - [X] android
  - [ ] lg TV
  - [ ] samsung TV
  - [ ] chromecast
  - [ ] iWatch
  - [ ] windows phone

<a name='contacts'></a>
## Contacts

#### Vigour

* **Valerio Barrila**, team leader, responsible for team organization and project execution
  * *Slack:* valerio
  * *Skype:* valerio.barrila
  * *Email:* valerio@vigour.io
  * *Phone:* +31 645 013 981
* **Shawn Inder**, main developer, responisble for core components
  * *Slack:* shawn
  * *Skype:* shawnfinder
  * *Email:* shawn@vigour.io
  * *Phone canada:* 1-514-903-9082
  * *Phone nl:* +31628959682
* **Renan Carvalho**, developer, responsible for web and tv
  * *Slack:* renan
  * *Email:* renan@vigour.io

#### External collaborators

* **Alexander van der Werff**, ios developer
  * *Slack:* werffmeister
  * *Skype:* avanderwerff
  * *Email:* alex@vigour.io
* **Michiel van Liempt**, android developer
  * *Slack:* michiel
  * *Skype:* michielvanliemptsoftware
  * *Email:* michiel@vigour.io
* **David Bina**, plugins developer (ios, android)
  * *Slack:* vidbina
  * *Skype:* kingvidbina
