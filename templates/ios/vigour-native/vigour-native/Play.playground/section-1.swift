// Playground - noun: a place where people can play

import Foundation
import JavaScriptCore


struct JSObject {
    let value:Dictionary<String, NSObject>
    
    init(_ value: Dictionary<String, NSObject>) {
        self.value = value
    }
    
    func jsString() -> String {
        var s = ""
        traverse(value, js: &s)
        return s
    }
    
    func traverse<T>(obj:T, inout js:String) {

        if let o = obj as? Dictionary<String, NSObject> {
            js += "{"
            var count = 0
            for (key, value) in o {
                count++
                js += "\"\(key)\":"
                traverse(value, js: &js)
                if count < o.count {
                    js += ", "
                }
            }
            js += "}"
        }
        else if let o = obj as? NSArray {
            js += "["
            for (index, item) in o.enumerate() {
                traverse(item, js: &js)
                if index < o.count - 1 {
                    js += ","
                }
            }
            js += "]"
        }
        else if let o = obj as? String {
            js += "\"\(o)\""
        }
        else if obj is NSNumber {
            js += "\(obj)"
        }
    }
}


let test = ["a":1, "b": true, "c":[1,2,3.3], "d":["e":"f"]]

let jso = JSObject(test)

jso.jsString()


var template = "Your name is %@ %@ and your age is %d."
let top = String(format: template, "John", "crap", 35)

protocol W {
    var v:String {get}
    static func instance() -> W
}
struct A:W {
    var v = "top"
    static func instance() -> W {
        return A()
    }
    init() {
        print("init")
    }
}

print(A.self)

let x = A.self
x.init()

func c(builder:() -> A) {
    let x = builder()
    x.v
}
c{A()}

func createClass<T: W>(classType: T.Type) {
    print(classType.instance())
}

createClass(A)

class MyClass: W {
    var v = "crap"
    static func instance() -> W {
        return MyClass()
    }
    class func top() {
        
    }
}

createClass(MyClass)
MyClass.instance()

let faa = "a"
let foo = "(\"\(faa)')"
print(foo)



let timeString = String(format: "function(%@){}", "{'a':'b'}")