//
//  Purchase.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 22/12/15.
//  Copyright © 2015 RxSwift. All rights reserved.
//

import Foundation
import StoreKit

public class Purchase:NSObject, SKProductsRequestDelegate, SKPaymentTransactionObserver, VigourPluginProtocol {
    
    static let sharedInstance = Purchase()
    
//    private let productIdentifiers: Set<String>
//    private var purchasedProductIdentifiers = Set<String>()
    
//    private var productsRequest: SKProductsRequest?
//    private var completionHandler: (success: Bool, products: [SKProduct]) -> ()?
    
    override init() {
        super.init()
    }
    
    //MARK:- VigourPluginProtocol
    
    static let pluginId:String = "purchase"
    
    weak var delegate: VigourBridgeViewController?
    
    func callMethodWithName(name: String, andArguments args: NSDictionary?, completionHandler: pluginResult) throws {
        print(name)
    }
    
    static func instance() -> VigourPluginProtocol {
        return Purchase.sharedInstance
    }
 
    func onReady() throws -> JSValue {
        return JSValue([Purchase.pluginId:"ready"])
    }
    
    //MARK:- SKProductsRequestDelegate
    
    public func productsRequest(request: SKProductsRequest, didReceiveResponse response: SKProductsResponse) {
        if response.products.count != 0 {
            for product in response.products {
                print(product)
            }
        }
        else {
            print("There are no products.")
        }
    }
    
    //MARK:- SKPaymentTransactionObserver
    
    public func paymentQueue(queue: SKPaymentQueue, updatedTransactions transactions: [SKPaymentTransaction]) {
        print(transactions)
    }
    
    //MARK:- Plugin API
    
    
    public func getProducts() {
        if SKPaymentQueue.canMakePayments() {
            let productIdentifiers = NSSet(array: productIDs)
            let productRequest = SKProductsRequest(productIdentifiers: productIdentifiers as! Set<NSObject>)
            
            productRequest.delegate = self
            productRequest.start()
        }
        else {
            println("Cannot perform In App Purchases.")
        }
    }
    
}