//
//  DummyPlugin.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 09/04/15.
//  Copyright (c) 2015 Vigour.io. All rights reserved.
//

import Foundation

class TestPlugin: VigourPlugin, VigourPluginMethod {
    
    
    func log(message: String) {
        print(message)
    }
    
    func callMehtodWithName(name: String, andArguments args:[AnyObject]?, completionHandler:bridgeMessage) {
        switch(name) {
        case "log":log("test")
        default:return
        }
    }
    
}