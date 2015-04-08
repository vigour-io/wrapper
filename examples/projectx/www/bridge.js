// for now just use global namespace
// TODO make a module and build with browserify

var platform = window.platform || 'android'
  , send
  , messageId = 1
  , callbackMap = {}

switch (platform) {
  case 'android':
    send = sendAndroid
    break
  case 'ios':
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
  if (cb) {
    cb(null, result)
  } else {
    addToDom("result without cb: " + error)
  }
}

function receiveNativeError(id, error) {
  var cb = popCallback(id)
  if (cb) {
    cb(error)
  } else {
    addToDom("error without cb: " + error)
  }
}

function popCallback(id) {
  if (!callbackMap[id]) {
     addToDom("illegal id: "+id) 
     return
  }
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
function receiveAndroidResult(id, result) {
  receiveNativeResult(id, result)
}

function receiveAndroidError(id, error) {
  receiveNativeError(id, error)
}

// TODO implement this
// I don't know if iOS will have one entry point for both success and failure or not
function receiveIos(message) {

}

