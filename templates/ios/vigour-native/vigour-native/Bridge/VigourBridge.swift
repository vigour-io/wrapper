//
//  BridgeController.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 09/04/15.
//  Copyright (c) 2015 Vigour.io. All rights reserved.
//

import Foundation
import WebKit

private let scriptMessageHandlerString = "vigourBridgeHandler"

class VigourBridge: NSObject, WKScriptMessageHandler {
 
    let pluginManager = VigourPluginManager.sharedInstance
    
    override init() {
        super.init()
        setup()
    }
    
    class func scriptMessageHandlerName() -> String {
        return scriptMessageHandlerString
    }
    
    
    private func setup() {
        
        //register plugins
        if let plugPath = NSBundle.mainBundle().pathForResource("Plugins", ofType: "plist") {
            if let plugins = NSDictionary(contentsOfFile: plugPath) as? Dictionary<String, String> {
                for (id, plugin) in plugins {
                    //NOTE: - module name hard dependancy! , later init plugs lazy
                    if let VigourPluginType = NSClassFromString("vigour_native.\(plugin)") as? VigourPlugin.Type {
                        pluginManager.registerPlugin(id, plugin: VigourPluginType(id: id))
                    }
                }
            }
        }
        
    }
    
    
    //MARK: - WKScriptMessageHandler
    
    func userContentController(userContentController: WKUserContentController, didReceiveScriptMessage message: WKScriptMessage) {
        
        // [callbackId: Int, pluginName: String, mehtod: String, args: AnyObject]
        if message.name == self.dynamicType.scriptMessageHandlerName() {
            if let m = message.body as? NSArray where m.count >= 3 {

                let callbackId = m.objectAtIndex(1) as! Int
                let pluginName = m.objectAtIndex(1) as! String
                let pluginFunc = m.objectAtIndex(2) as! String
                if let plugInstance = pluginManager.plugins[pluginName] {
                    if plugInstance.respondsToSelector(Selector(pluginFunc)) {
                        println("jep")
                    }
                }

            }
        }
        
    }
    
}