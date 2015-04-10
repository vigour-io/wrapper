//
//  VigourPluginManager.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 09/04/15.
//  Copyright (c) 2015 Vigour.io. All rights reserved.
//

import Foundation

private let vigourPluginManager = VigourPluginManager()

class VigourPluginManager {
    
    var plugins:[String:NSObject] = [:]
    
    class var sharedInstance: VigourPluginManager {
        return vigourPluginManager
    }
    
    init() {
        
    }
    
    func registerPlugin(id: String, plugin: VigourPlugin) {
        plugins[id] = plugin
    }
    
    func callPlugin(name: String, method: String, params: Array<AnyObject>) {
        
    }
    
}