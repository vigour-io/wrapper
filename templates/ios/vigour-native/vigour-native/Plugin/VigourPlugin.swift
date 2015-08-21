//
//  VigourPlugin.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 09/04/15.
//  Copyright (c) 2015 Vigour.io. All rights reserved.
//
// Because the aim for the framework is to try to create it as Swift as possible we have to make some conventions 
// Swift does not (yet fully, initial support is starting, with dump() etc), support introspection, so we need another
// way to know which methods are available in a plugin. We might could use some custom obj class, but initial we choose
// for some conventions.

// A plugin need to confirm to: f(message: Message) -> Message
// A plugin should inherit from base class VigourPlugin
// A plugin should add a mapping to an enumeration of type .Methods { methdod="methdod",


import Foundation


protocol VigourPluginMethod {
    func shouldCallMehtodWithName(name: String, andArguments args:[AnyObject]?)
}

class VigourPlugin : NSObject {
    
    // plugin name
    let id: String
    
    required init(id: String) {
        self.id = id
        super.init()
    }
    
    func register() {
    }
    
    /// this method can't be overridden
    final func callMethod(name: String, args: Array<AnyObject>?) {
        
    }
    
}