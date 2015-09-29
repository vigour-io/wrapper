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
    var javaScriptString: String { get }
}

struct JSError: JSStringProtocol {
    let title: String
    let description: String
    let todo: String?
    var javaScriptString: String
}

enum VigourBridgeSendMessage: JSStringProtocol {
    case Error(error: JSError?, pluginId: String)
    case Receive(error: JSError?, message: [String:AnyObject], pluginId: String)
    case Result(calbackId: Int, error: JSError?, response: [String:AnyObject])
    case Ready(error: JSError?, response: [String:AnyObject], pluginId: String)
    
    var javaScriptString: String {
        get {
            switch self {
            case .Error(let error, let pluginId):return ""
            case .Ready(let error, let response, let pluginId): return ""
            case .Result(let calbackId, let error, let response):
                let jsString = "\(scriptMessageResultCallback)(\(callbackId), null, {})"
                return ""
            case .Receive(let error, let message, let pluginId): return ""
            }
        }
    }
    
    private func jsStringBuilder(object: [String:AnyObject]) -> String {
        
    }
    
}
