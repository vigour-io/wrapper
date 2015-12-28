//
//  Facebook.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 19/11/15.
//  Copyright © 2015 RxSwift. All rights reserved.
//

import Foundation

struct FacebookShareLinkValue {
    let title:String?
    let urlString:String
    let description:String?
    let imageUrlString:String?
}

enum VigourFacebookMethod: String {
    case Login="login", Logout="logout", Share="share", Init="init"
}

class Facebook: NSObject, VigourPluginProtocol, FBSDKSharingDelegate {
    
    private static let sharedInstance = Facebook()
    
    var shareCompletionHandler:pluginResult?
    
    static let pluginId = "facebook"
    
    weak var delegate: VigourBridgeViewController? {
        didSet {
            #if DEBUG
                print("delegate set for \(Facebook.pluginId)")
            #endif
        }
    }
    
    static func instance() -> VigourPluginProtocol {
        return sharedInstance
    }
    
    func callMethodWithName(name: String, andArguments args: NSDictionary?, completionHandler: pluginResult) throws {
        if let method = VigourFacebookMethod(rawValue: name) {
            switch method {
            case .Init:
                if FBSDKAccessToken.currentAccessToken() != nil {
                    completionHandler(nil, JSValue([
                        "connectionStatus": "connected",
                        "token": FBSDKAccessToken.currentAccessToken().tokenString,
                        "userId": FBSDKAccessToken.currentAccessToken().userID
                        ]
                        )
                    )
                }
                else {
                    completionHandler(nil, JSValue(["connectionStatus": "unknown"]))
                }
            case .Login:
                
                //check if scope is passed
                login(args?.objectForKey("scope") as? [String] ?? [], completionHandler: completionHandler)
                
            case .Logout:
                
                logout(completionHandler)
                
            case .Share:
                
                if let link = args?.objectForKey("url") as? String {
                    
                    let shareValue = FacebookShareLinkValue(
                        title: args?.objectForKey("title") as? String,
                        urlString: link,
                        description: args?.objectForKey("description") as? String,
                        imageUrlString: args?.objectForKey("image") as? String
                    )
                    share(shareValue, completionHandler:completionHandler)
                    
                }
                else {
                    completionHandler(JSError(title: "Facebook share needs a link", description: "No link found to share", todo: "Add a link to share?"), JSValue([:]))
                }
                
                
            }
        }
        else {
            completionHandler(JSError(title: "Facebook method error", description: "No valid method name was matched for the Facebook plugin", todo: "Check if the right method name is used?"), JSValue([:]))
        }
        
    }
    
    func onReady() throws -> JSValue {
        
        //init stuff
        
        return JSValue([Facebook.pluginId:"ready"])
    }
    
    //Methods
    
    private func login(scope:[String], completionHandler: pluginResult) {
        
        let loginMgr = FBSDKLoginManager()
        
        //The view controller to present from. If nil, the topmost view controller will be automatically determined as best as possible.
        loginMgr.logInWithReadPermissions(scope, fromViewController: nil, handler: { (result, error) -> Void in
            if error != nil {
                completionHandler(JSError(title: "Facebook plugin error: \(error.code)", description: error.localizedDescription, todo: error.localizedRecoverySuggestion), JSValue([:]))
                #if DEBUG
                    print("FB ERROR: \(error.localizedDescription)")
                #endif
                return
            }
            else if result != nil {
                var repsonse:[String:NSObject] = [
                    "isCancelled":result.isCancelled
                ]
                if result.grantedPermissions != nil {
                    repsonse["grantedPermissions"] = Array(result.grantedPermissions)
                }
                if result.declinedPermissions != nil {
                    repsonse["declinedPermissions"] = Array(result.declinedPermissions)
                }
                if result.token != nil {
                    repsonse["connectionStatus"] = "connected"
                    repsonse["token"] = result.token.tokenString != nil ? result.token.tokenString : ""
                    repsonse["userID"] = result.token.userID != nil ? result.token.userID : ""
                    repsonse["userId"] = result.token.expirationDate != nil ? result.token.expirationDate.description : ""
                }
                completionHandler(nil, JSValue(repsonse))
            }
        })
    }
    
    private func logout(completionHandler: pluginResult) {
        let loginMgr = FBSDKLoginManager()
        loginMgr.logOut()
        FBSDKAccessToken.setCurrentAccessToken(nil)
        completionHandler(nil, JSValue([:]))
    }
    
    private func share(shareValue: FacebookShareLinkValue, completionHandler: pluginResult) {
        shareCompletionHandler = completionHandler
        #if DEBUG
            print("SHARING:: ", shareValue)
        #endif
        let content = FBSDKShareLinkContent()
        content.contentTitle = shareValue.title
        if let description = shareValue.description {
            content.contentDescription = description
        }
        if let url = NSURL(string: shareValue.urlString) {
            content.contentURL = url
        }
        if let imageUrlString = shareValue.imageUrlString, let imageUrl = NSURL(string: imageUrlString) {
            content.imageURL = imageUrl
        }
        if let d = delegate as? UIViewController {
            FBSDKShareDialog.showFromViewController(d, withContent: content, delegate: self)
        }
    }
    
    
    //MARK: - FBSDKSharingDelegate
    
    func sharer(sharer: FBSDKSharing!, didCompleteWithResults results: [NSObject : AnyObject]!) {
        #if DEBUG
            print("SHARING COMPLETED:: \(results)")
        #endif
        if let completionHandler = shareCompletionHandler {
            completionHandler(nil, JSValue(["message":"share completed"]))
        }
    }
    
    func sharer(sharer: FBSDKSharing!, didFailWithError error: NSError!) {
        #if DEBUG
            print("SHARING ERROR:: \(error)")
        #endif
        if let completionHandler = shareCompletionHandler {
            completionHandler(JSError(title: "Facebook plugin error: \(error.code)", description: error.localizedDescription, todo: error.localizedRecoverySuggestion), JSValue([:]))
        }
    }
    
    func sharerDidCancel(sharer: FBSDKSharing!) {
        #if DEBUG
            print("SHARING CANCELLED")
        #endif
        if let completionHandler = shareCompletionHandler {

            completionHandler(JSError(title: "Facebook plugin error", description: "User canceled ", todo: ""), JSValue([:]))
        }
    }
    
}