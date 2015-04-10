//
//  StatusBarPlugin.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 09/04/15.
//  Copyright (c) 2015 Vigour.io. All rights reserved.
//

import Foundation

class StatusBarPlugin: VigourPlugin, VigourPluginMethod {
 
    func showStatusBar() {
        
    }
    
    func hudeStatusBar() {
        
    }
    
    func shouldCallMehtodWithName(name: String, andArguments args: [AnyObject]?) {
        switch(name) {
        case "show": showStatusBar()
        case "hide": hudeStatusBar()
        default:return
        }
    }
    
}
