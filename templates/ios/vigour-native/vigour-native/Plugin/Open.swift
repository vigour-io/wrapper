//
//  Open.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 19/11/15.
//  Copyright © 2015 RxSwift. All rights reserved.
//

import Foundation
import VigourCore

struct OpenURLValue {
    let urlString:String
}

enum VigourOpenMethod: String {
    case Open="open", Init="init"
}

class Open: NSObject, VigourPluginProtocol {

    private static let sharedInstance = Open()

    var shareCompletionHandler:PluginResult?

    static let pluginId = "open"

    weak var delegate: VigourBridgeViewController? {
        didSet {
            #if DEBUG
                print("delegate set for \(Open.pluginId)")
            #endif
        }
    }

    static func instance() -> VigourPluginProtocol {
        return sharedInstance
    }

    func callMethodWithName(name: String, andArguments args: NSDictionary?, completionHandler: PluginResult) throws {
        if let method = VigourOpenMethod(rawValue: name) {
            switch method {
            case .Init:
                completionHandler(nil, JSValue(["name": "outside"]))
            case .Open:

                if let urlString = args?.objectForKey("url") as? String, let url = NSURL(string: urlString) {
                    open(url, completionHandler:completionHandler)
                }
                else {
                    completionHandler(JSError(title: "Open needs a link", description: "No link found to open", todo: "`open.url.val = <url>`?"), JSValue([:]))
                }
            }
        }
        else {
            completionHandler(JSError(title: "Open method error", description: "No valid method name was matched for the Open plugin", todo: "Check if the right method name is used?"), JSValue([:]))
        }

    }

    func onReady() throws -> JSValue {
        //init stuff
        return JSValue([Open.pluginId:"ready"])
    }

    //Methods

    private func open(url: NSURL, completionHandler: PluginResult) {
        #if DEBUG
            print("open url:: ", url)
        #endif
        UIApplication.sharedApplication().openURL(url)
        completionHandler(nil, JSValue(true))
    }

}
