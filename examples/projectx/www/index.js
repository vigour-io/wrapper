document.getElementById('thebutton').addEventListener("click", start)

function start() {
    NativeInterface.log('start')

    var oldnodes = document.getElementsByClassName('debug-output')
    if (oldnodes.length)
    {
        oldnodes.map(function(node) { node.remove() })
    }

    //add(NativeInterface.getInterface())
    for( var fn in NativeInterface ) {
        add(fn);
    }

    NativeInterface.log('end')
}

function result(data) {
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

function add(fn) {
    var p = document.createElement('p')
    p.setAttribute('class', 'debug-output')
    p.appendChild(document.createTextNode(fn))
    document.getElementById('container').appendChild(p)
    p.addEventListener("click", function()
                                {
                                  NativeInterface[fn]("")
                                })
}