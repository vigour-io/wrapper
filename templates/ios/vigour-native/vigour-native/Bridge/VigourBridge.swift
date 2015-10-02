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


enum VigourBridgeError: ErrorType {
    case BridgeError(String)
    case PluginError(String, pluginId:String)
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

    internal func sendJSMessage(message: VigourBridgeSendMessage) {
        if let d = delegate {
            d.webView?.evaluateJavaScript(message.jsString(), completionHandler: { (_, error) -> Void in
                
            })
        }
    }
    

    internal func receiveBridgeMessage(message:VigourBridgeMessage) {
        
        if let plug = VigourPluginManager.pluginTypeMap[message.pluginId] as? VigourPluginProtocol.Type {
            
            //get the insance or singleton
            let p = plug.instance()
            
            //call the method
            do {
                try p.callMethodWithName(message.pluginMethod, andArguments: message.arguments, completionHandler: { [weak self] (error, result) -> Void in
                    
                    if error != nil {
                        print(error)
                        self?.sendJSMessage(VigourBridgeSendMessage.Error(error: error, pluginId: message.pluginId))
                    }
                    else if let callbackId = message.callbackId {
                        self?.sendJSMessage(VigourBridgeSendMessage.Result(error: nil, calbackId: callbackId, response: result))
                    }
                })
            }
            catch VigourBridgeError.PluginError(let message, let pluginId) {
                //TODO: throw it to js side!
            }
            catch let error as NSError {
                print(error.localizedDescription)
            }
            
        }
        
    }
    
    private final func processScriptMessage(message:WKScriptMessage) throws -> VigourBridgeMessage? {
        if let messageObject = message.body as? NSDictionary where messageObject.count >= 3 {
        
            guard (messageObject.objectForKey("pluginId") as? String != nil) else { throw VigourBridgeError.BridgeError("Plugin id required!") }
            
            guard (messageObject.objectForKey("fnName") as? String != nil) else { throw VigourBridgeError.BridgeError("Plugin id required!") }
            
            if let pluginId = messageObject.objectForKey("pluginId") as? String,
                let fnName = messageObject.objectForKey("fnName") as? String {
                    
                return VigourBridgeMessage(callbackId: messageObject.objectForKey("cbId") as? Int, pluginId:pluginId, pluginMethod: fnName, arguments:messageObject.objectForKey("opts") as? NSDictionary)
                    
            }
        }
        return nil
    }
    
    //MARK: - WKScriptMessageHandler
    
    func userContentController(userContentController: WKUserContentController, didReceiveScriptMessage message: WKScriptMessage) {
        
        if let messageObject = message.body as? NSDictionary where messageObject.count >= 2
            && message.name == self.dynamicType.scriptMessageHandlerName() {
            
            do {
                if let bridgeMessage = try processScriptMessage(message) {
                    receiveBridgeMessage(bridgeMessage)
                }
            }
            catch VigourBridgeError.BridgeError(let message) {
                VigourBridgeSendMessage.Error(error: JSError(title:"Bridge Error", description:message, todo:""), pluginId: "")
            }
            catch let error as NSError {
                print(error.localizedDescription)
            }
            
        }
        
    }
    
}