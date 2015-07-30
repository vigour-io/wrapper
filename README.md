# vigour-native

Builds a set of native apps from a single javascript codebase.

## Dependencies

- npm 2@ˆ2

## Install
- Add `git+ssh://git@github.com:vigour-io/vigour-native.git#master` to dependencies in package.json
- `npm i vigour-native --save` (Coming soon)


## Usage

Declaring vigour-native as a dependency to a project make an executable called vNative accessible. You can then build the project with `vNative build` or `vNative build --<platform>` (see [supported platforms](#user-content-platforms)). Configuration is read from the project's package.json[`vigour.native`].


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

## More

usecase 
  client - project X
    requires -- vigour-facebook
                  ios
                  android
                  native-bridge
                  web
                  and the V.Value wrapped api (this is what is exposed)
                  


examples package.json vigour-facebook
```
  {
    dependencies: {
      vigour-native:'x.x.x'
    }
  }
```

example install project X
```
  //this gets added by vigour dev tools ( just some run scripts )
  npm run build --android --ios
```

example install project X
```
  //this gets added by vigour dev tools ( just some run scripts )
  cd projectX
  vigour-dev-tools build -android
```

example install project X
```
  //this gets added by vigour dev tools ( just some run scripts )
  npm run build --android --ios
```

pck.json settings project X
```
  vigour: {
    native: {
      ios: {
        bundle-id: "io.vigour.x"
        version: 2.0.11,
        facebook-key: "123123123123",
        store-key: "acbdbcadbcbadbc"
      },
      android: {
        package: "io.vigour.x"
        version: 2.1.3,
        facebook-key: "9ae87f9a8e7f98a7f",
        store-key: "bbed9c87ed9c87e9b98b7ed"
      }
    }
  }
```
}
  
Icons etc
```
{
  native: {
    icon: '../icon'
  }
}
```