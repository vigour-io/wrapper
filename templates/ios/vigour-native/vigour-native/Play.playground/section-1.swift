// Playground - noun: a place where people can play

import Foundation

protocol test {
    func isMethodForName(name: String) -> ()->()
}

struct Message {
    let value: String
    let type: Int
}

class A : NSObject {
    let name: String
    required init(name: String) {
        self.name = name
    }
    
    var functions:Dictionary<String, ()->()> = [:]
}

class B: A, test {
    
    func a() -> Void {
        println(name)
    }
    
    func b(index:Message) -> Message {
        return Message(value: "top", type: 1)
    }
    func isMethodForName(name: String) -> ((Message) -> (Message)) {
        switch(name) {
            case "b": return b
        default:return {Message(value: "", type: 1)}
        }
    }
}

let b = B(name: "yoho")
b.isMethodForName("a")()
b.isMethodForName("")()