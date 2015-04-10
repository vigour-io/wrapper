//
//  VigourPlugin.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 09/04/15.
//  Copyright (c) 2015 Vigour.io. All rights reserved.
//

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