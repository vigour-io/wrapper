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

enum PurchaseError: ErrorType {
    case NoPayment
}

class ProductFetcher:NSObject, SKProductsRequestDelegate {
    
    typealias ProductsHandler = (Bool, [SKProduct], [String:String]) -> ()
    var completionHandler: ProductsHandler?
    let products: [String:String]
    
    init(products: [String:String]) {
        self.products = products
        super.init()
    }
    
    deinit {
        #if DEBUG
        print("Product Fetcher deinited")
        #endif
    }
    
    func fetch(completionHandler: ProductsHandler) throws {
        if SKPaymentQueue.canMakePayments() {
            self.completionHandler = completionHandler
            var productIdentifiers: Set<String> = ([])
            for product in products {
                productIdentifiers.insert(product.1)
            }
            let productsRequest = SKProductsRequest(productIdentifiers: productIdentifiers)
            productsRequest.delegate = self
            productsRequest.start()
        }
        else {
            throw PurchaseError.NoPayment
        }
    }
    
    func productsRequest(request: SKProductsRequest, didReceiveResponse response: SKProductsResponse) {
        if let c = completionHandler {
            c(true, response.products, products)
        }
    }
    
    func request(request: SKRequest, didFailWithError error: NSError) {
        #if DEBUG
        print(error)
        #endif
        if let c = completionHandler {
            c(false, [], products)
        }
    }
    
}

public class Purchase:NSObject, SKPaymentTransactionObserver, VigourPluginProtocol {
    
    static let sharedInstance = Purchase()
    
    override init() {
        super.init()
        
        //prepare
        setup()
    }
    
    //MARK:- VigourPluginProtocol
    
    static let pluginId:String = "pay"
    
    weak var delegate: VigourBridgeViewController?
    
    func callMethodWithName(name: String, andArguments args: NSDictionary?, completionHandler: PluginResult) throws {
        guard let method = PurchaseMethod.init(rawValue: name)
        else {
            throw VigourBridgeError.PluginError("Unsupported method!", pluginId: Orientation.pluginId)
        }
        switch method {
        case .Init:
            break
        case .GetProducts:
            if let products = args! as? [String:String]  {
                getProducts(products, completionHandler:completionHandler)
            }
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
    
    //MARK:- Prepare
    
    private func setup() {
        
        //check for product id's in package
//        if let path = NSBundle.mainBundle().pathForResource("www/package", ofType:"json") {
//            do {
//                let jsonData = try NSData(contentsOfFile: path, options: NSDataReadingOptions.DataReadingMappedIfSafe)
//                let json = try NSJSONSerialization.JSONObjectWithData(jsonData, options: .AllowFragments)
//                
//                if let vigour = json["vigour"] as? [String: AnyObject],
//                    let pay = vigour["pay"] as? [String: AnyObject],
//                    let iOS = pay["iOS"] as? [String: AnyObject],
//                    let products = iOS["products"] as? [String: AnyObject] {
//                        for product in products {
//                            productIdentifiers.insert(product.1 as! String)
//                        }
//                }
//                
//            }
//            catch {
//                print("error serializing JSON: \(error)")
//            }
//        }
        
        
    }
    
    //MARK:- SKPaymentTransactionObserver
    
    public func paymentQueue(queue: SKPaymentQueue, updatedTransactions transactions: [SKPaymentTransaction]) {
        print(transactions)
    }
    
    //MARK:- Plugin API
    
    private func getProducts(productsReq:[String:String], completionHandler: PluginResult) {
        
        var fetchProducts:ProductFetcher?
        fetchProducts = ProductFetcher(products: productsReq)
        
        do {
            try fetchProducts!.fetch() { (success:Bool, products, productsReq) -> () in
                
                if success {
                    for product in products {
                        print(product.localizedDescription, product.price)
                    }
                }
                else {
                    completionHandler(JSError(title: "Pay error", description: "Fetching products failed", todo: ""), JSValue([:]))
                }
                
                fetchProducts = nil

            }
        }
        catch PurchaseError.NoPayment {
            completionHandler(JSError(title: "Pay error", description: "Can't make payments", todo: "Check if account is setup with bank info"), JSValue([:]))
        }
        catch {
            completionHandler(JSError(title: "Pay error", description: "Fetching products failed", todo: ""), JSValue([:]))
        }
    }
    
    
}