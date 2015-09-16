#Android native modules

This folder holds the npm packages that are necessary for building/debugging android apps. 

The current understanding is that there will be one gradle based android project and a number of gradle based android *library* projects. The main project - [CloudWrapper](./CloudWrapper) - exists mainly of a crosswalk view that loads our javascript app and initialization of necessary Play Store and Play Services initialization.

For the *modules* (that have the same role as cordova plugins) we will make library projects. We have considered automatically wrapping existing modules or sdks like for example the ChromeCast functionality or the Facebook Sdk, but this has proven to be unfeasible as setting up these modules usually consist of tying classes into the lifecycle of the main activity or passing java objects and callbacks to certain methods. In other words setting up these modules need to happen in java after which we can expose a simplified API to javascript.

### java to javascript interface

We can keep our library projects pretty lightweight by letting the main project - CloudWrapper - take care of marshalling API methods and take care of argument checking and error generation. We still have to choose the mechanism to expose java API to javascript. `WebView#addJavascriptInterface()` is tempting but we might choose a different method bucause although the change of script injection is small, the risks are quite severe as described [here](https://labs.mwrinfosecurity.com/blog/2013/09/24/webview-addjavascriptinterface-remote-code-execution)

Currently it seems we will make every exposed java function take a JSON String as parameter and return a JSON String. The paramter has to be an object with named arguments (maybe an array can work too) and the returned string is an object with something like `{error:null, value:3}` or whatever.