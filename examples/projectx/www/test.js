
function testOneWay(message) {
    wrapTry(testSend)(message)
}

function testSimple() {
    wrapTry(callNative)('dummy', 'dummy', [], function(error, value) {
        if (error) {
            addToDom("error: " + error)
        } else {
            addToDom("success!: " + value)
        }
    })
}

function wrapTry(fn) {
    return function() {
        try{
            fn.apply(fn, arguments)
        } catch(e) {
            addToDom("exception: " + e)
        }
    }
}

function addToDom(data) {
    var p = document.createElement('p')
    p.setAttribute('class', 'debug-output')
    p.appendChild(document.createTextNode(data))
    var container = document.getElementById('container');
    if (container.firstChild) {
        container.insertBefore(p, container.firstChild)
    } else {
        container.appendChild(p)
    }
}

