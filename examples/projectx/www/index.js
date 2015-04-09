
var bridge = require('../../../lib/bridge')
document.getElementById('thebutton').addEventListener("click", start)

function testSend (msg) {
  bridge.send(msg)
}
function testOneWay(message) {
    wrapTry(testSend)(message)
}

function testSimple() {
  wrapTry(callNative)('dummy', 'dummy', [], function(error, value) {
    if (error) {
      bridge.addToDom("error: " + error)
    } else {
      bridge.addToDom("success!: " + value)
    }
  })
}

function wrapTry(fn) {
  return function() {
    try{
      fn.apply(fn, arguments)
    } catch(e) {
      bridge.addToDom("exception: " + e)
    }
  }
}