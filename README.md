# vigour-native

Builds a set of native apps from a single javascript codebase.

## Dependencies

- npm 2@ˆ2

## Install
- Add `git+ssh://git@github.com:vigour-io/vigour-native.git#master` to dependencies in package.json
- `npm i vigour-native --save` (Coming soon)


## Usage

Declaring vigour-native as a dependency to a project make an executable called vNative accessible. You can then build the project with `vNative build` or `vNative build -- <platform>` (see [supported platforms](#user-content-platforms)). Configuration is read from the project's package.json[`vigour.native`].


## Building a Test APP

###LG steps:

LG have two technology stack for building webapps for tvs, WebOs TV and NetCast TV

Vigour Native only supports for now the NetCast TV technology.(Soon we will support both)

After you finish your app development:


#### Preparing the app

1 - run ```npm run build -- -p lgtv```

2 - Go to build/lgtv

3 - Copy the zip file (WebContent.zip)

#### Lg developer site

4 - Login in http://developer.lge.com/main/Intro.dev 

5 - Go to menu resourcecenter > netcasttv

6 - Select the ```test``` option and ```app test``` --> new app test

#### Uploading the app

1 - Fill the app title with any name (This will be displayed on the tv as your app name)

2 - Select ```Web``` in the app type and ```all```

3 - Fill ```index.html``` in the URL field ( this is the entry point of your app)

4 - Upload the zip file generated on step 1

5 - Select an icon (This will be used to show your app on the TV)

6 - Click on save

7 - Wait a little bit 

#### Downloading the DRM

1 - Click on dowload 

#### Preparing the USB flash drive

1 - Go to the USB flash drive and create the following folder
  -lgapps/installed

2 - Unzip the dowloaded file inside the folder(lgapps/installed)

#### Testing on TV

1 - Plug the USB flash drive on the tv

2 - Go to ```smart``` select ```more apps```

3 - You will see an icon similiar to usb icons. Click there and you should see your app.


###Samsung steps:


#### Preparing the app

1 - run ```npm run build -- -p samsungtv```

#### Preparing a simple server

You will need a simple server to serve content to the TV, in this example I'm using ```http-server```.
using ```npm install http-server -g``` will download it.

1 - Go to the build/samsungtv folder and run ```sudo http-server -p 80```

#### Setting up the TV

1 - Go to smart tv hub

2 - Log with the develop account ( username : develop, password : '' ```leave blank```)

3 - Find the options button on the screen

4 - Find the the IP settings

5 - Fill the ip field with your machine IP

6 - Select ```start sync...```

7 - If everything is correct you app will be installed on the TV


Info : The TV messages aren't good, if you have any problem please let me know (Renan Carvalho - renan@vigour.io)


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
