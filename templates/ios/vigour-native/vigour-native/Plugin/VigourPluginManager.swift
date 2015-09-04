//
//  VigourPluginManager.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 09/04/15.
//  Copyright (c) 2015 Vigour.io. All rights reserved.
//

import Foundation

private let vigourPluginManager = VigourPluginManager()

struct VigourPluginManager {
    
    var plugins:[String:VigourPlugin] = [:]
    
    static var sharedInstance: VigourPluginManager {
        return vigourPluginManager
    }
    
    init() {
        setup()
    }
    
    private mutating func setup() {
        //register plugins
        if let plugPath = NSBundle.mainBundle().pathForResource("Plugins", ofType: "plist") {
            if let plugins = NSDictionary(contentsOfFile: plugPath) as? Dictionary<String, String> {
                for (id, plugin) in plugins {
                    //NOTE: - module name hard dependancy! , later init plugs lazy
                    if let VigourPluginType = NSClassFromString("vigour_native.\(plugin)") as? VigourPlugin.Type {
                        registerPlugin(id.lowercaseString, plugin: VigourPluginType.init(id: id))
                    }
                }
            }
        }
    }
    
    mutating func registerPlugin(id: String, plugin: VigourPlugin) {
        plugins[id] = plugin
    }
    
    func callPlugin(name: String, method: String, params: Array<AnyObject>) {
        
    }
    
}