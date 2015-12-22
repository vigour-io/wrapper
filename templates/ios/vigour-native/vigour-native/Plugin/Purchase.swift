//
//  Purchase.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 22/12/15.
//  Copyright © 2015 RxSwift. All rights reserved.
//

import Foundation
import StoreKit

public class Purchase: VigourPluginProtocol {
    
    static let sharedInstance = Orientation()
    
    private let productIdentifiers: Set<ProductIdentifier>
    private var purchasedProductIdentifiers = Set<ProductIdentifier>()
    
    private var productsRequest: SKProductsRequest?
    private var completionHandler: RequestProductsCompletionHandler?
    
    //MARK:- VigourPluginProtocol
    
    static let pluginId:String = "purchase"
    
    weak var delegate: VigourBridgeViewController?
    
    func callMethodWithName(name: String, andArguments args: NSDictionary?, completionHandler: pluginResult) throws {
        
    }
    
    static func instance() -> VigourPluginProtocol {
        return Purchase.sharedInstance
    }
 
    func onReady() throws -> JSValue {
        return JSValue([Purchase.pluginId:"ready"])
    }
    
    
    //MARK:- Plugin API
    
    
    public func getProducts() {
        
    }
    
}