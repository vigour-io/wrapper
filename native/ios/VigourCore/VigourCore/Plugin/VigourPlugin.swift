//
//  VigourPlugin.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 09/04/15.
//  Copyright (c) 2015 Vigour.io. All rights reserved.
//


import Foundation


public typealias PluginResult = (JSError?, JSValue) -> Void

public protocol VigourPluginProtocol {
    weak var delegate:VigourBridgeViewController? { get set }
    static var pluginId:String { get }
    func callMethodWithName(name: String, andArguments args:NSDictionary?, completionHandler:PluginResult) throws
    func onReady() throws -> JSValue
    static func instance() -> VigourPluginProtocol
}