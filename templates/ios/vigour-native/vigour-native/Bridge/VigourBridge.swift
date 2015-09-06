//
//  BridgeController.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 09/04/15.
//  Copyright (c) 2015 Vigour.io. All rights reserved.
//

import Foundation
import WebKit

internal let scriptMessageHandlerString = "vigourBridgeHandler"
internal let scriptMessageReadyCallback = "window.vigour.native.bridge.ready"
internal let scriptMessageReceiveCallback = "window.vigour.native.bridge.receive"

enum VigourBridgeError: ErrorType {
    case BridgeError(String)
}

class VigourBridge: NSObject, WKScriptMessageHandler {
    
    var pluginManager:VigourPluginManager?
    weak var delegate: VigourViewController?
    
    init(pluginManager: VigourPluginManager) {
        super.init()
        self.pluginManager = pluginManager
        setup()
    }
    
    class func scriptMessageHandlerName() -> String {
        return scriptMessageHandlerString
    }
    
    
    private func setup() {
        
    }
    
    internal func sendJSMessage(callbackId:Int, arguments:NSDictionary?, error:NSError?) {
        if let d = delegate {
            let jsString = "\(scriptMessageReceiveCallback)(\(callbackId), null, {})"
            d.webView?.evaluateJavaScript(jsString, completionHandler: { (_, error) -> Void in
                
            })
        }
    }
    

    internal func receiveBridgeMessage(message:VigourBridgeMessage) {
        
        if let plug = VigourPluginManager.pluginTypeMap[message.pluginId] as? VigourPluginProtocol.Type {
            let p = plug.instance()
            p.callMethodWithName("log", andArguments: message.arguments, completionHandler: { [weak self] (error, result) -> Void in
                if error != nil {
                    print(error)
                }
                else {
                    self?.sendJSMessage(message.callbackId, arguments:result, error: error)
                }
            })
        }
        
    }
    
    private final func processScriptMessage(message:WKScriptMessage) throws -> VigourBridgeMessage? {
        if let messageObject = message.body as? NSDictionary where messageObject.count >= 3 {
        
            guard (messageObject.objectForKey("cbId") as? Int != nil) else { throw VigourBridgeError.BridgeError("Callback id of type number required for calling callback") }
        
            guard (messageObject.objectForKey("pluginId") as? String != nil) else { throw VigourBridgeError.BridgeError("Plugin id required!") }
            
            guard (messageObject.objectForKey("fnName") as? String != nil) else { throw VigourBridgeError.BridgeError("Plugin id required!") }
            
            if let cbId = messageObject.objectForKey("cbId") as? Int,
                let pluginId = messageObject.objectForKey("pluginId") as? String,
                let fnName = messageObject.objectForKey("fnName") as? String {
                    
                return VigourBridgeMessage(callbackId:cbId, pluginId:pluginId, pluginMethod: fnName, arguments:messageObject.objectForKey("opts") as? NSDictionary)
                    
            }
        }
        return nil
    }
    
    //MARK: - WKScriptMessageHandler
    
    func userContentController(userContentController: WKUserContentController, didReceiveScriptMessage message: WKScriptMessage) {
        
        if let messageObject = message.body as? NSDictionary where messageObject.count >= 3
            && message.name == self.dynamicType.scriptMessageHandlerName() {
            
            do {
                if let bridgeMessage = try processScriptMessage(message) {
                    receiveBridgeMessage(bridgeMessage)
                }
            }
            catch VigourBridgeError.BridgeError(let message) {
                print(message)
            }
            catch let error as NSError {
                print(error.localizedDescription)
            }
            
        }
        
    }
    
}