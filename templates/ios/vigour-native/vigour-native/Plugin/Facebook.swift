//
//  Facebook.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 19/11/15.
//  Copyright © 2015 RxSwift. All rights reserved.
//

import Foundation

class Facebook: VigourPluginProtocol {

    static let pluginId = "vigour-facebook"
    
    weak var delegate: VigourViewController?
    
    static func instance() -> VigourPluginProtocol {
        return Facebook()
    }
    
    func callMethodWithName(name: String, andArguments args: NSDictionary?, completionHandler: pluginResult) throws {
//        do {
//            try
//        }
//        catch {
//            
//        }
//        switch(name) {
//        case "login":
//            
//        default:break
//        }
        
        completionHandler(nil, JSObject(["succes":true]))
    }
    
    func onReady() throws -> JSObject {
        return JSObject([Facebook.pluginId:"ready"])
    }
    
}