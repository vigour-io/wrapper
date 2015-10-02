//
//  VigourPlugin.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 09/04/15.
//  Copyright (c) 2015 Vigour.io. All rights reserved.
//


import Foundation


typealias pluginResult = (JSError?, JSObject) -> Void

protocol VigourPluginProtocol {
    weak var delegate:VigourViewController? { get set }
    static var pluginId:String { get }
    func callMethodWithName(name: String, andArguments args:NSDictionary?, completionHandler:pluginResult)
    static func instance() -> VigourPluginProtocol
}