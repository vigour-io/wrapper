// for now just use global namespace
// TODO make a module and build with browserify

var Platform = 'android'
  , send
  , messageId = 1
  , callbackMap = {}

switch (Platform) {
  case 'android':
    send = send_android
    break
  case 'android':
    send = send_ios
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
  send([id, pluginId, fnName, param])
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
function send_android(message) {
  NativeInterface.send(JSON.stringify(message))
}

function send_ios(message) {

}

/**
 * called by the android counterpart
 * expects a serialised array with [id,result,error]
**/
function receive_android_result(result) {
  receiveNativeResult(JSON.parse(result))
}

function receive_android_error(error) {
  receiveNativeError(JSON.parse(error))
}

function receive_ios(message) {

}

