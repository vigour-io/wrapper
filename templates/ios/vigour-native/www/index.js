require('./styles.less')
var bridge = require('../../../../lib/bridge')
  , Element = require('vigour-js/ui/element')

var app = new Element({
  node: document.body
  , header:
  {
    node: 'h1'
    , text: "Testing the native bridge"
  }
  , werf:
  { node: 'button'
    , text: "tap me"
    , events:
    { click: function () {
        doSome()
      }
    }
  }
  , t1:
  {
    node: 'button'
    , text: "send 'test message'"
    , events:
    {
      click: function () {
        testOneWay('test message')
      }
    }
  }
  , t2:
  {
    node: 'button'
    , text: "dummy/dummy()"
    , events:
    {
      click: function () {
        testSimple()
      }
    }
  }
  , t3:
  {
    node: 'button'
    , text: "statusbar/hide()"
    , events:
    {
       click: function () {
        testSimple('statusbar','hide')
      }
    }
  }
  , t4:
  {
    node: 'button'
    , text: "statusbar/show()"
    , events:
    {
       click: function () {
        testSimple('statusbar','show')
      }
    }
  }
  , t5:
  {
    node: 'button'
    , text: "test/log('test log message')"
    , events:
    {
       click: function () {
        testSimple('test', 'log', 'test log message')
      }
    }
  }
  , t6:
  {
    node: 'button'
    , text: "test/echo('test echo message')"
    , events:
    {
       click: function () {
        testSimple('test', 'echo', 'test echo message')
      }
    }
  }
  , t7:
  {
    node: 'button'
    , text: "test/vibrate()"
    , events:
    {
       click: function () {
        testSimple('test', 'vibrate')
      }
    }
  }
  , t8:
  {
    node: 'button'
    , text: "test/getTime()"
    , events:
    {
       click: function () {
        testSimple('test', 'getTime')
      }
    }
  }
  , container:
  {
    attr: { id: "container" }
  }
})

function doSome() {
  var div = document.createElement('div')
  div.innerHTML = "tap tap tap"
  document.body.appendChild(div)
  try {
    window.webkit.messageHandlers.vigourBridgeHandler.postMessage([1,2,3])
    window.webkit.messageHandlers.vigourBridgeHandler.postMessage({"a":[1,2], "b":"c"})
    //ignores funcs passing
    // window.webkit.messageHandlers.vigourBridgeHandler.postMessage({"a":[1,2], "b":function(){return 1}})
  } catch(err) {
    console.log('The native context does not exist yet');
  }
}

function testSend (msg) {
  bridge.send(msg)
}
function testOneWay (message) {
    wrapTry(testSend)(message)
}

function testSimple () {
    var plugin = arguments[0] || 'dummy'
    var fnName = arguments[1] || 'dummy'
    var args = arguments[2] || []
    wrapTry(callNative)(plugin, fnName, args, function(error, value) {
        if (error) {
            addToDom("error: " + error)
        } else {
            addToDom("success!: " + value)
        }
    })

}

function wrapTry (fn) {
  return function() {
    try{
      fn.apply(fn, arguments)
    } catch(e) {
      bridge.addToDom("exception: " + e)
    }
  }
}
