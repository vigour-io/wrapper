//
//  StatusBar.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 16/12/15.
//  Copyright © 2015 RxSwift. All rights reserved.
//

import Foundation

enum VigourStatusBarMethod: String {
    case Init="init", Background="background", Display="display"
}

class StatusBar: VigourPluginProtocol {
    
    private let light = Int("ffffff", radix: 16)
    
    //MARK: - VigourPluginProtocol
    
    static let pluginId = "statusbar"
    
    weak var delegate: VigourBridgeViewController?
    
    func callMethodWithName(name: String, andArguments args:NSDictionary?, completionHandler:PluginResult) throws {
        if let methodName = VigourStatusBarMethod(rawValue: name) {
            switch(methodName) {
            case .Init:
                
                if let d = delegate  {
                    let statusBarStatus = d.statusBarHidden ? "hidden" : "overlay"
                    let statusBarStyle = d.statusBarStyle == .Default ? "000000" : "ffffff"
                    completionHandler(nil, JSValue(["display":statusBarStatus, "background":["color":statusBarStyle, "opacity":"0"]]))
                }
                
            case .Background:
                if let bgColor = args?.objectForKey("color") as? String, let d = delegate {
                    let digitColor = Int(bgColor, radix: 16)
                    if digitColor > (light! / 2)  {
                        d.statusBarStyle = .Default
                    }
                    else {
                        d.statusBarStyle = .LightContent
                    }
                }
            case .Display:
                if let d = delegate {
                    if let display = args?.objectForKey("display") as? String {
                        d.statusBarHidden = (display == "hidden")
                    }
                    else {
                        //toggle
                        d.statusBarHidden = !d.statusBarHidden
                    }
                }
            }
        }
    }
    
    func onReady() throws -> JSValue {
        return JSValue([StatusBar.pluginId:"ready"])
    }
    
    static func instance() -> VigourPluginProtocol {
        return StatusBar()
    }
    
    //MARK: - Plugin implementation
    
    func log(message: AnyObject) {
        print("<Vigour Log> \(message)")
    }
    
}