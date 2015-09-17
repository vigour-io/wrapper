// Playground - noun: a place where people can play

import Foundation

protocol test {
    func isMethodForName(name: String) -> ()->()
}

class VigourPlugin {
    static var pluginTypeMap:[String:Any] = [:]
    required init() {
        print("some plug is inited")
    }
    class func instance() -> VigourPlugin {
        return VigourPlugin()
    }
    func test() {
        print("crap")
    }
}
let b = VigourPlugin()

VigourPlugin.pluginTypeMap["plug"] = VigourPlugin.self
if let c = VigourPlugin.pluginTypeMap["plug"] as? VigourPlugin.Type {
    print(c.dynamicType)
    print(c.init())
    print(c.instance())

}
let p = NSStringFromClass(VigourPlugin)


if let aClass = NSClassFromString("VigourPlugin") as? VigourPlugin.Type {

    print(aClass)
}
