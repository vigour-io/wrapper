#Android native code

This folder holds the native android projects necessary to build an android app.

The main project - [app](./app) - exists mainly of a crosswalk view that loads our *javascript app* and has a plugin manager that exposes injected *plugins* to the javascript app.

The notion of a Plugin and a PluginManager is central to this setup. They are defined in [plugincore](.plugincore), which is a java projects that builds a jar.

## Building

This app template is designed to compile and run as is from either command line or Android Studio. So you can build it from Android Studio or by going into the folder and run `./gradlew assemble`.

But the more logical thing to do is to run the npm script from a project that depends on vigour-native. We'll call this the *user-project*. When this happens the scripts in lib/build/android will:
1. Build options are set from the user-project's `package.json` and commandline options and env vars.
1. Build plugincore
1. Upload it to a local maven repository ()
For this the folder `$ANDROID_HOME/extras/android/m2repository` is used. This only works for SNAPHOT releases, that's why the plugincore and any plugins must always have SNAPSHOT in the version number.
1. The template is copied to the build folder of the user-project
1. The template is customized with things like:
  - app name
  - app indentifier
  - version
  - app icon
  - splash screen
1. A list of plugins is taken from the build options.
Each of these plugins is build (which will upload it to the same local maven repository as plugincore). And for each plugin code is injected into the template for initialisation etc.
1. Finally the customised template in the build folder of the user-project is build into an apk
1. If the `--android-run` option was set the apk is loaded onto a connected device and launced.

## Plugins

For the *plugins* we will make library projects. So a user-project will define a npm dependency on a npm project. This plugin project will have necessary information in it's `package.json` to tell the build process how to inject it into the template, see the [statusbar](github.com/vigour-io/vigour-native-statusBar) plugin for an example.

### java to javascript interface

The plugin manager of the app project handles calling plugin methods and responses are sent to a javascript function defined in the [bridge](../../lib/bridge). We use `WebView#addJavascriptInterface()` to allow calling native functions. We still have to check if the security risks described [here](https://labs.mwrinfosecurity.com/blog/2013/09/24/webview-addjavascriptinterface-remote-code-execution) are valid for our setup. (It might not be because we use XWalkView and compile for a higher SDK)
