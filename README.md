[![Build Status](https://travis-ci.org/vigour-io/wrapper.svg?branch=develop)](https://travis-ci.org/vigour-io/wrapper)

# Wrapper

Builds a set of native apps from a single javascript codebase.

`npm install vigour-wrapper`

## Dependencies

- npm 2@ˆ2
- cocoapods, see http://guides.cocoapods.org/using/getting-started.html (some plugins might require it)

## Install
- Add `git+ssh://git@github.com:vigour-io/vigour-native.git#master` to dependencies in package.json
- `npm i vigour-native --save` (Coming soon)


## Usage

Declaring vigour-native as a dependency to a project make an executable called `wrapper` accessible. You can then build the project with `wrapper build` or `wrapper build -- <platform>` (see [supported platforms](#user-content-platforms)). Configuration is read from the project's package.json[`vigour.native`].


###Observations:


####SamsungTv

[More info about the package.json fields here](https://docs.google.com/document/d/1T74xvRt5IG_dmIqo4G5fBhED0meoyFFROF_9MMdaG7k/edit)

####Lg webos Tv
For Lg webostv, a manually process is required before run the build script. Lg uses a SDK to generate ipk files, and this SDK is not available on npm. To download the SDK just go to [LG developer web site](http://developer.lge.com/webOSTV/sdk/web-sdk/sdk-installation/), and follow the steps. If you want to understand more about the SDK CLI you can [read more here](http://developer.lge.com/webOSTV/sdk/web-sdk/webos-tv-cli/using-webos-tv-cli/ ).


####Tizen Tv
If you want to test your project on the TV, you will need to download the [Tizen SDK](http://www.samsungdforum.com/Tizendevtools/Sdkdownload). Today (24/12/2015) the only version that works good is the version 2.4.0, but you can download the latest version on the web site and when you start the installation process, you can specify the version 2.4.0.

* How to setup the developer mode on the tv ?

  - Go to smart hub and press, 1,2,3,4,5. Then fill the ip field with you machine IP. After that restart the tv on the eletric power(Remove it from the eletric socket).
  
* How to see my app on the tv?

  - After the step above ^^^; you will need to run ```npm run tizentv``` and import the wgt file on the IDE. Once your peoject was imported, click on the 'remote device manager' in the connection tab. Then insert your TV IP address and do not change the default port. Right click on the project and choose '''run as''' and select your TV.

######Tizen info in package.json:
| Key  |Value   |
|---|---|
| appName  | The name that will be displayed as your app on the tv  |
| iconPath  | The app icon, must be  512x423 pixel JPG or PNG format icon  |
| yourDomain | The web site domain, Tizen uses it as a kind of identifier (ID) |
| appVersion | Application version number. e.g 1.0.0 |
| Location | Object that contains name and description for the contries that the app will be available |

More info : [config.xml](http://www.samsungdforum.com/Support/Distribution)


It May help :
  
  
- [Tizen develop mode](http://www.samsungdforum.com/TizenGuide/tizen3511/index.html)

- [Tizen Tv Emulator](http://www.samsungdforum.com/TizenGuide/tizen2911/index.html)  
  


##### specific details:
 - Use the default folder path when installing the SDK

 - The build process only uses the SDK CLI. It means that you can install only the CLI from SDK the package.

 - ```ares-package ``` comand is used by the build script to generate the IPK file using the SDK CLI.

 - The IPK file name is generated automatically, it uses the ```id``` property in ```appinfo.json``` to generate it.



## Tests

Most of the tests expect to find the `vigour-example` repo in the same directory as `vigour-native`. If that is so, then `mocha test/` should do the rest. This of course should be improved eventually, either by making vigour-example a submodule, or by automating the cloning the first time tests are run, or perhaps even something entirely different...

## In-script usage

```
var wrapper = require('vigour-native')
wrapper.build({
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
var wrapper = require('vigour-native')
  , Promise = require('promise') // `npm i promise`
  , build = Promise.denodeify(wrapper.build)
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
  - [X] lg net cast TV (old platform)
  - [X] lg Webos TV (new platform)
  - [X] samsung TV
  - [X] samsung Tizen TV
  - [x] chromecast
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
* **Renan Carvalho**, developer, responsible for web and tv's
  * *Slack:* renan
  * *Email:* renan@vigour.io
  * *Skype:* renanacarvalho
  * *Phone:* +31 633 882 626
#### External collaborators

* **Alexander van der Werff**, ios developer
  * *Slack:* werffmeister
  * *Skype:* avanderwerff
  * *Email:* meister@alexandervanderwerff.com
* **Michiel van Liempt**, android developer
  * *Slack:* michiel
  * *Skype:* michielvanliemptsoftware
  * *Email:* michiel@vigour.io
* **David Bina**, plugins developer (ios, android)
  * *Slack:* vidbina
  * *Skype:* kingvidbina
  * *Email:* david@supr.nu
