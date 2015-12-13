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

    var pluginManager:VigourPluginManager = {
        #if DEBUG
            print("*****CREATE PLUGIN MANAGER*****")
        #endif
        return VigourPluginManager()
    }()

    weak var delegate: VigourViewController? {
        didSet {

        }
    }

    override init() {
        super.init()
        #if DEBUG
            print("*****INIT BRIDGE*****")
        #endif
        setup()
    }

    class func scriptMessageHandlerName() -> String {
        return scriptMessageHandlerString
    }


    private func setup() {
       //additional setup
    }

    final func activate() {

        var token: dispatch_once_t = 0
        dispatch_once(&token) { [weak self] () -> Void in
            self?.makePluginsAvailable()
        }
        sendJSMessage(VigourBridgeSendMessage.Ready(error: nil, response: JSValue(["bridge":"ready"]), pluginId: nil))
    }

    private final func makePluginsAvailable() {
        VigourPluginManager.pluginTypeMap.forEach{ (pluginId, type) in
            //VigourBridgeSendMessage.Ready
            if let plug = VigourPluginManager.pluginTypeMap[pluginId] {

                //get an insance or shared instance
                var p = plug.instance()
                p.delegate = delegate
                //call
                do {
                    try sendJSMessage(VigourBridgeSendMessage.Ready(error: nil, response: p.onReady(), pluginId: pluginId))
                }
                catch VigourBridgeError.PluginError(let message, let pluginId) {
                    sendJSMessage(VigourBridgeSendMessage.Receive(error: JSError(title:"Plugin Error", description: message, todo:""), event:"error", message:JSValue(false), pluginId: pluginId))
                }
                catch let error as NSError {
                    sendJSMessage(VigourBridgeSendMessage.Receive(error: JSError(title:"Error", description: error.localizedDescription, todo:error.localizedRecoverySuggestion), event:"error", message:JSValue(false), pluginId: nil))
                    #if DEBUG
                        print(error.localizedDescription)
                    #endif
                }
            }
        }
    }

    /**
        Sends evaluates a js message and insert it in the web js context
        @param VigourBridgeSendMessage
     */
    internal final func sendJSMessage(message: VigourBridgeSendMessage) {
        #if DEBUG
            print("Sending")
            print(message.jsString())
        #endif
        
        //MARK:- make sure evanluate js back on the main thread
        dispatch_async(dispatch_get_main_queue()) { [weak self] in
        
            if let weakSelf = self, let d = weakSelf.delegate, webView = d.webView {
                webView.evaluateJavaScript(message.jsString(), completionHandler: { (_, error) -> Void in
                    if error != nil {
                        print(error)
                    }
                })
            }
            
        }
    }

    internal final func receiveBridgeMessage(message:VigourBridgeReceiveMessage) {
        #if DEBUG
            print("Receiving")
            print(message)
        #endif
        if let plug = VigourPluginManager.pluginTypeMap[message.pluginId] {

            //get an insance or shared instance
            var p = plug.instance()

            //set delegate to be sure if instance is not a shared instance
            if let d = delegate {
                p.delegate = d
            }

            //call the method
            do {
                try p.callMethodWithName(message.pluginMethod, andArguments: message.arguments, completionHandler: { [weak self] (error, result) -> Void in

                    if error != nil {
                        #if DEBUG
                            print(error)
                        #endif
                    }
                    if let callbackId = message.callbackId {
                        self?.sendJSMessage(VigourBridgeSendMessage.Result(error: error, calbackId: callbackId, response: result))
                    }
                })
            }
            catch VigourBridgeError.PluginError(let message, let pluginId) {
                sendJSMessage(VigourBridgeSendMessage.Receive(error: JSError(title:"Plugin Error", description: message, todo:""), event:"error", message:JSValue(false), pluginId: pluginId))
            }
            catch let error as NSError {
                sendJSMessage(VigourBridgeSendMessage.Receive(error: JSError(title:"Error", description: error.localizedDescription, todo:error.localizedRecoverySuggestion), event:"error", message:JSValue(false), pluginId: nil))
                #if DEBUG
                    print(error.localizedDescription)
                #endif
            }

        }

    }

    /**
        @param message, script mesage receiving from vigour js
     */
    private final func processScriptMessage(message:WKScriptMessage) throws -> VigourBridgeReceiveMessage? {
        if let messageObject = message.body as? NSDictionary where messageObject.count == 1 {
            
            guard (messageObject.objectForKey("event") as? String != nil) else { throw VigourBridgeError.BridgeError("event param required!") }
            
            /*Activate bridge on this plugin*/
            if let event = messageObject.objectForKey("event") as? String where event == "bridgeReady" {
                activate()
            }
            
        }
        else if let messageObject = message.body as? NSDictionary where messageObject.count >= 3 {

            guard (messageObject.objectForKey("pluginId") as? String != nil) else { throw VigourBridgeError.BridgeError("Plugin id required!") }

            guard (messageObject.objectForKey("fnName") as? String != nil) else { throw VigourBridgeError.BridgeError("Plugin id required!") }

            if let pluginId = messageObject.objectForKey("pluginId") as? String,
                let fnName = messageObject.objectForKey("fnName") as? String {

                return VigourBridgeReceiveMessage(callbackId: messageObject.objectForKey("cbId") as? Int, pluginId:pluginId, pluginMethod: fnName, arguments:messageObject.objectForKey("opts") as? NSDictionary)

            }
        }
        return nil
    }

    //MARK: - WKScriptMessageHandler

    func userContentController(userContentController: WKUserContentController, didReceiveScriptMessage message: WKScriptMessage) {

        if let messageObject = message.body as? NSDictionary where messageObject.count >= 1
            && message.name == self.dynamicType.scriptMessageHandlerName() {

            do {
                if let bridgeMessage = try processScriptMessage(message) {
                    receiveBridgeMessage(bridgeMessage)
                }
            }
            catch VigourBridgeError.BridgeError(let message) {
                VigourBridgeSendMessage.Receive(error: JSError(title:"Bridge Error", description: message, todo:""), event: "error", message: JSValue(false), pluginId: nil)
            }
            catch let error as NSError {
                sendJSMessage(VigourBridgeSendMessage.Receive(error: JSError(title:"Error", description: error.localizedDescription, todo:error.localizedRecoverySuggestion), event:"error", message:JSValue(false), pluginId: nil))
                #if DEBUG
                    print(error.localizedDescription)
                #endif
            }

        }

    }

}
