// Playground - noun: a place where people can play

import Foundation

class A : NSObject {
    let name: String
    required init(name: String) {
        self.name = name
    }
}

class B: A {
    
    func a() -> Void {
        println(name)
    }
    
}

var b = B(name: "B")


if b.respondsToSelector("a") {
    b.a()
}