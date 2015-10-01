//
//  VigourBridgeJSMessage.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 28/09/15.
//  Copyright © 2015 Vigour.io. All rights reserved.
//

import Foundation

internal let scriptMessageErrorCallback = "window.vigour.native.bridge.error"
internal let scriptMessageReadyCallback = "window.vigour.native.bridge.ready"
internal let scriptMessageResultCallback = "window.vigour.native.bridge.result"
internal let scriptMessageReceiveCallback = "window.vigour.native.bridge.receive"

protocol JSStringProtocol {
     func jsString() -> String
}

struct JSError: JSStringProtocol {
    let title: String
    let description: String
    let todo: String?
    func jsString() -> String {
        return "new Error()"
    }
}

struct JSObject: JSStringProtocol {
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

enum VigourBridgeSendMessage: JSStringProtocol {
    case Error(error: JSError?, pluginId: String)
    case Receive(error: JSError?, message: JSObject, pluginId: String)
    case Result(calbackId: Int, error: JSError?, response: JSObject)
    case Ready(error: JSError?, response: JSObject, pluginId: String?)
    
    func jsString() -> String {
        switch self {
        case .Error(let error, let pluginId):return ""
        case .Ready(let error, let response, let pluginId):
            var js = "\(scriptMessageReadyCallback)("
            if let e = error {
                js += "(\(e.jsString()), "
            }
            else {
                js += "null"
            }
            js += "\(response.jsString())"
            if let id = pluginId {
                js += ", \(id))"
            }
            else {
                ")"
            }
        case .Result(let callbackId, let error, let response):
            let jsString = "\(scriptMessageResultCallback)(\(callbackId), null, {})"
            return ""
        case .Receive(let error, let message, let pluginId): return ""
        }
    }
    
}
