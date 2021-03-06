//
//  Purchase.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 22/12/15.
//  Copyright © 2015 RxSwift. All rights reserved.
//

import Foundation
import StoreKit
import VigourCore

enum PurchaseMethod: String {
    case Init="init", GetProducts="getProducts", Buy="buy"
}

enum PurchaseError: ErrorType {
    case NoPayment
}

extension SKProduct {
    
    func localizedPrice() -> String {
        let formatter = NSNumberFormatter()
        formatter.numberStyle = .CurrencyStyle
        formatter.locale = self.priceLocale
        return formatter.stringFromNumber(self.price)!
    }
    
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

class Purchase:NSObject, SKPaymentTransactionObserver, VigourPluginProtocol {
    
    private var productsLookup = [String:SKProduct]()
    
    private var purchaseLookup = [String:PluginResult]()
    
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
            throw VigourBridgeError.PluginError("Unsupported method!", pluginId: Purchase.pluginId)
        }
        switch method {
        case .Init:
            
            SKPaymentQueue.defaultQueue().restoreCompletedTransactions()
            
        case .GetProducts:
            if let products = args! as? [String:String]  {
                getProducts(products, completionHandler:completionHandler)
            }
        case .Buy:
            if let productId = args!["id"] as? String, let product = productsLookup[productId] {
                let payment = SKPayment(product: product)
                purchaseLookup[payment.productIdentifier] = completionHandler
                SKPaymentQueue.defaultQueue().addPayment(payment)
            }
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
        
        SKPaymentQueue.defaultQueue().addTransactionObserver(self)
        
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
    
    internal func paymentQueue(queue: SKPaymentQueue, updatedTransactions transactions: [SKPaymentTransaction]) {
        for transaction in transactions {
            switch (transaction.transactionState) {
            case .Purchased:
                completeTransaction(transaction)
            case .Failed:
                failedTransaction(transaction)
            case .Restored:
                restoreTransaction(transaction)
            case .Deferred:
                break
            case .Purchasing:
                break
            }
        }
    }
    
    private func completeTransaction(transaction: SKPaymentTransaction) {
        #if DEBUG
            print("completeTransaction")
        #endif
        
        if let handler = purchaseLookup[transaction.payment.productIdentifier] {
            
            
            handler(nil, JSValue(retrieveReceipt()))
            
            purchaseLookup[transaction.payment.productIdentifier] = nil
        }
        
        SKPaymentQueue.defaultQueue().finishTransaction(transaction)
    }
    
    private func restoreTransaction(transaction: SKPaymentTransaction) {
        #if DEBUG
            print("**Restore Transaction**", transaction.payment.productIdentifier)
        #endif
    }
    
    private func failedTransaction(transaction: SKPaymentTransaction) {
        #if DEBUG
            print("failedTransaction")
        #endif

        if let error = transaction.error, let handler = purchaseLookup[transaction.payment.productIdentifier] {
            
            var errorTitle = ""
            switch error.code {
            case SKErrorCode.ClientInvalid.rawValue:
                errorTitle = "Client Invalid"
            case SKErrorCode.PaymentCancelled.rawValue:
                errorTitle = "Payment Cancelled"
            case SKErrorCode.PaymentInvalid.rawValue:
                errorTitle = "Payment Invalid"
            case SKErrorCode.PaymentNotAllowed.rawValue:
                errorTitle = "Payment Not Allowed"
            case SKErrorCode.StoreProductNotAvailable.rawValue:
                errorTitle = "Product Not Available"
            default:
                errorTitle = "Unknown Transaction Error"
            }
            
            handler(JSError(title:errorTitle, description: error.localizedDescription, todo:error.localizedRecoverySuggestion), JSValue([:]))
            
            purchaseLookup[transaction.payment.productIdentifier] = nil
            
        }
        SKPaymentQueue.defaultQueue().finishTransaction(transaction)
    }
    
    //MARK:- Plugin API
    
    private func getProducts(productsReq:[String:String], completionHandler: PluginResult) {
        
        var fetchProducts:ProductFetcher?
        fetchProducts = ProductFetcher(products: productsReq)
        
        let formatter = NSNumberFormatter()
        formatter.locale = NSLocale.autoupdatingCurrentLocale()
        
        do {
            try fetchProducts!.fetch() { [weak self] (success:Bool, products, productsReq) -> () in
                
                if success {
                    
                    if let weakSelf = self {
                        weakSelf.cacheProducts(products)
                    }
                    
                    var jsObject = [String:[String:String]]()
                    
                    for p in productsReq {
                        
                        
                        
                        let indexOptional = products.indexOf({ (product) -> Bool in
                            product.productIdentifier == p.1
                        })
                        if let index = indexOptional {
                            
                            let prod = products[index]
                            formatter.locale = prod.priceLocale
                            
                            jsObject[p.0] = [
                                "description":prod.localizedDescription,
                                "price":"\(prod.price)",
                                "title":prod.localizedTitle,
                                "priceLocale":prod.localizedPrice(),
                                "productIdentifier":prod.productIdentifier,
                                "currency" : formatter.currencySymbol,
                                "currencyCode" : formatter.currencyCode
                            ]
                            
                        }
                        
                    }
                    
                    completionHandler(nil, JSValue(jsObject))
                    
                    #if DEBUG
                    print(jsObject)
                    #endif
                    
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
    
    private func cacheProducts(products:[SKProduct]) {
        for product in products {
            productsLookup[product.productIdentifier] = product
        }
        #if DEBUG
            print("Number of products: ", productsLookup.count)
        #endif
    }
    
    //https://developer.apple.com/library/ios/releasenotes/General/ValidateAppStoreReceipt/Chapters/ValidateRemotely.html
    private func retrieveReceipt() -> String {
        let receiptUrl = NSBundle.mainBundle().appStoreReceiptURL
        if let receipt: NSData = NSData(contentsOfURL: receiptUrl!) {
            let receiptString = receipt.base64EncodedStringWithOptions(NSDataBase64EncodingOptions(rawValue: 0))
            return receiptString
        }
        return ""
    }
    
}