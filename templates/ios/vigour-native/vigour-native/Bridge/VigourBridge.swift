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
    weak var delegate: MainViewController?
    
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
                        pluginManager.registerPlugin(id.lowercaseString, plugin: VigourPluginType(id: id))
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
                
                let callbackId = (m.objectAtIndex(0) as! NSNumber).integerValue
                let pluginName = (m.objectAtIndex(1) as! String).lowercaseString
                let pluginFunc = m.objectAtIndex(2) as! String
                let args = m.objectAtIndex(3) as! NSDictionary
                
                //FOR DEMO STATUSBAR IS DIRECTLY HANDLED HERE
                if pluginName == "statusbar" && pluginFunc == "get", let d = delegate {
                    let status = d.statusBarHidden ? "hidden" : "overlay"
                    let js = "window.receiveNativeResult(\(callbackId), {visibility:'\(status)'})"
                    d.webView?.evaluateJavaScript(js, completionHandler: { (res, error) -> Void in
                        
                    })
                }
                else if pluginName == "statusbar" && pluginFunc == "set", let d = delegate, let status = args.objectForKey("visibility") as? String {
                    if status == "overlay" {
                        d.statusBarHidden = false
                    }
                    else {
                        d.statusBarHidden = true
                    }
                    let js = "window.receiveNativeResult(\(callbackId), {visibility:'\(status)'})"
                    d.webView?.evaluateJavaScript(js, completionHandler: { (res, error) -> Void in
                        
                    })
                }
                
                /*if let plugInstance = pluginManager.plugins[pluginName] {
                
                
                println(plugInstance)
                
                }*/
                
            }
        }
        
    }
    
}