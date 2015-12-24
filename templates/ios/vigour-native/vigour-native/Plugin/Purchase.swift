//
//  Purchase.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 22/12/15.
//  Copyright © 2015 RxSwift. All rights reserved.
//

import Foundation
import StoreKit

enum PurchaseMethod: String {
    case Init="init", GetProducts="getProducts", Buy="buy"
}

public class Purchase:NSObject, SKProductsRequestDelegate, SKPaymentTransactionObserver, VigourPluginProtocol {
    
    static let sharedInstance = Purchase()
    
    private var productIdentifiers: Set<String> = ([])
//    private var purchasedProductIdentifiers = Set<String>()
    
//    private var productsRequest: SKProductsRequest?
//    private var completionHandler: (success: Bool, products: [SKProduct]) -> ()?
    
    override init() {
        super.init()
        
        //prepare
        setup()
    }
    
    //MARK:- VigourPluginProtocol
    
    static let pluginId:String = "pay"
    
    weak var delegate: VigourBridgeViewController?
    
    func callMethodWithName(name: String, andArguments args: NSDictionary?, completionHandler: pluginResult) throws {
        guard let method = PurchaseMethod.init(rawValue: name)
        else {
            throw VigourBridgeError.PluginError("Unsupported method!", pluginId: Orientation.pluginId)
        }
        switch method {
        case .Init:
            break
        case .GetProducts:
            getProducts(completionHandler)
        case .Buy:
            break
        }
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
                print(product.price)
            }
        }
        else {
            print("There are no products.")
            
        }
    }
    
    //MARK:- Prepare
    
    private func setup() {
        
        //check for product id's in package
        if let path = NSBundle.mainBundle().pathForResource("www/package", ofType:"json") {
            do {
                let jsonData = try NSData(contentsOfFile: path, options: NSDataReadingOptions.DataReadingMappedIfSafe)
                let json = try NSJSONSerialization.JSONObjectWithData(jsonData, options: .AllowFragments)
                
                if let vigour = json["vigour"] as? [String: AnyObject],
                    let pay = vigour["pay"] as? [String: AnyObject],
                    let iOS = pay["iOS"] as? [String: AnyObject],
                    let products = iOS["products"] as? [String: AnyObject] {
                        for product in products {
                            productIdentifiers.insert(product.1 as! String)
                        }
                }
                
            }
            catch {
                print("error serializing JSON: \(error)")
            }
        }
        
        
    }
    
    //MARK:- SKPaymentTransactionObserver
    
    public func paymentQueue(queue: SKPaymentQueue, updatedTransactions transactions: [SKPaymentTransaction]) {
        print(transactions)
    }
    
    //MARK:- Plugin API
    
    
    private func getProducts(completionHandler: pluginResult) {
        if SKPaymentQueue.canMakePayments() {
//            let productIdentifiers = Set(["mtv_play_single_episode_purchase", "mtv_play_subscription_annual", "mtv_play_subscription_monthly"])
            let productRequest = SKProductsRequest(productIdentifiers: productIdentifiers)
            
            productRequest.delegate = self
            productRequest.start()
        }
        else {
            completionHandler(JSError(title: "Pay error", description: "Can't make payments", todo: "Check if account is setup with bank info"), JSValue([:]))
        }
    }
    
}