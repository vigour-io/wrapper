// Playground - noun: a place where people can play

import Foundation
import JavaScriptCore

print("e")

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
        else if let o = obj as? Bool {
            js += "\(o)"
        }
    }
}


let test = ["a":1, "b":true, "c":[1,2,3.3], "d":["e":"f"]]

let jso = JSObject(test)

jso.jsString()

