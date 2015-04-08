// for now just use global namespace
// TODO make a module and build with browserify

var Platform = 'android'
  , send
  , messageId = 1
  , callbackMap = {}

switch (Platform) {
  case 'android':
    send = sendAndroid
    break
  case 'android':
    send = sendIos
    break

} 

///////////////////
// module api
///////////////////

/**
  call a function in a native plugin
  @param {String} pluginId
  @param {String} fnName
  @param {Object} params
  @param {Function(err, value)} cb
 **/
function callNative(pluginId, fnName, params, cb) {
  var id = messageId++
  callbackMap[id] = cb
  send([id, pluginId, fnName, params])
}

function testSend(str) {
  send(str)
}

module.exports.call = callNative

//////////////////////
// platform independant handling response
/////////////////////

function receiveNativeResult(id, result) {
  var cb = popCallback(id)
  cb(null, result)
}

function receiveNativeError(id, error) {
  var cb = popCallback(id)
  cb(error)
}

function popCallback(id) {
  var cb = callbackMap[id]
  delete callbackMap[id]
  return cb
}

////////////////////////
// platform dependant implementations for send / receive
////////////////////////

/**
  wil send a message to the native side and returns immediately

  @param {Object} message
**/
function sendAndroid(message) {
  NativeInterface.send(JSON.stringify(message))
}

function sendIos(message) {

}

/**
 * called by the android counterpart
 * expects a serialised array with [id,result,error]
**/
function receiveAndroidResult(result) {
  receiveNativeResult(JSON.parse(result))
}

function receiveAndroidError(error) {
  receiveNativeError(JSON.parse(error))
}

// TODO implement this
// I don't know if iOS will have one entry point for both success and failure or not
function receiveIos(message) {

}

