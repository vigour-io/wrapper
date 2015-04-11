// Playground - noun: a place where people can play

import Foundation

protocol test {
    func isMethodForName(name: String) -> ()->()
}

class Message: NSObject {
    let value: String
    let type: Int
    init(value: String, type: Int) {
        self.value = value
        self.type = type
    }
}

class A : NSObject {
    let name: String
    required init(name: String) {
        self.name = name
    }
    
    var functions:Dictionary<String, ()->()> = [:]
}

class B: A {
    
    func a() -> Void {
        println(name)
    }
    
    dynamic func b(index:Message) -> AnyObject {
        return Message(value: "", type: 1)
    }

}

Swift.Int

