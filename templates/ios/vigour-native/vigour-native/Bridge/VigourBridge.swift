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
    
    private func sendJSMessage(message:VigourBridgeMessage) {
        
    }
    
    //        var message = {
    //            pluginId: pluginId,
    //            fnName: fnName,
    //            opts: opts,
    //            cbId: cbId
    //        }
    private func receiveJSMessage(message:WKScriptMessage) throws {
        if let messageObject = message.body as? NSDictionary where messageObject.count >= 3 {
            
            print(messageObject.objectForKey("cbId")!.dynamicType)
            
        }
    }
    
    //MARK: - WKScriptMessageHandler
    
    func userContentController(userContentController: WKUserContentController, didReceiveScriptMessage message: WKScriptMessage) {
        
        if message.name == self.dynamicType.scriptMessageHandlerName() {
            do {
              try receiveJSMessage(message)
            }
            catch let error as NSError {
                print(error)
            }
        }
        
    }
    
}