//
//  Facebook.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 19/11/15.
//  Copyright © 2015 RxSwift. All rights reserved.
//

import Foundation

struct FacebookShareValue {
    let title:String
    let urlString:String?
    let description:String?
    let imageUrlString:String?
}

enum VigourFacebookMethod: String {
    case Login="login", Logout="logout", Share="share"
}

class Facebook: NSObject, VigourPluginProtocol, FBSDKSharingDelegate {

    private static let sharedInstance = Facebook()
    
    var shareCompletionHandler:pluginResult?
    
    static let pluginId = "io.vigour.facebook"
    
    weak var delegate: VigourViewController? {
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
            case .Login:
                
                //check if scope is passed
               login(args?.objectForKey("scope") as? [String] ?? [], completionHandler: completionHandler)
                
            case .Logout:
                
                logout(completionHandler)
                
            case .Share:
                let shareValue = FacebookShareValue(
                                title: args?.objectForKey("title") as? String ?? "Vigour is awsome!",
                                urlString: args?.objectForKey("urlString") as? String,
                                description: args?.objectForKey("description") as? String,
                                imageUrlString: args?.objectForKey("imageUrlString") as? String
                            )
                share(shareValue, completionHandler:completionHandler)
            }
        }
        else {
            completionHandler(JSError(title: "Facebook method error", description: "No valid method name was matched for the Facebook plugin", todo: "Check if the right method name is used?"), JSObject([:]))
        }

    }
    
    func onReady() throws -> JSObject {
        
        //init stuff
        
        return JSObject([Facebook.pluginId:"ready"])
    }
    
    //Methods
    private func login(scope:[String], completionHandler: pluginResult) {
        
        let loginMgr = FBSDKLoginManager()
        
        //The view controller to present from. If nil, the topmost view controller will be automatically determined as best as possible.
        loginMgr.logInWithReadPermissions(scope, fromViewController: nil, handler: { (result, error) -> Void in
            if error != nil {
                completionHandler(JSError(title: "Facebook plugin error: \(error.code)", description: error.localizedDescription, todo: error.localizedRecoverySuggestion), JSObject([:]))
                #if DEBUG
                    print("FB ERROR: \(error.localizedDescription)")
                #endif
                return
            }
            else if result != nil {
                completionHandler(nil, JSObject(
                    ["authResponse":
                        [
                            "accessToken":result.token.tokenString,
                            "userID":result.token.userID,
                            "expiresIn":result.token.expirationDate.description
                        ],
                        "isCancelled":result.isCancelled,
                        "grantedPermission":Array(result.grantedPermissions),
                        "declinedPermissions":Array(result.declinedPermissions),
                    ]
                ))
            }
        })
    }
    
    private func logout(completionHandler: pluginResult) {
        let loginMgr = FBSDKLoginManager()
        loginMgr.logOut()
        completionHandler(nil, JSObject([:]))
    }
    
    private func share(shareValue: FacebookShareValue, completionHandler: pluginResult) {
        shareCompletionHandler = completionHandler
        #if DEBUG
        print("SHARING:: ", shareValue)
        #endif
        let content = FBSDKShareLinkContent()
        content.contentTitle = shareValue.title
        if let description = shareValue.description {
            content.contentDescription = description
        }
        if let urlString = shareValue.urlString, let url = NSURL(string: urlString) {
            content.contentURL = url
        }
        if let imageUrlString = shareValue.imageUrlString, let imageUrl = NSURL(string: imageUrlString) {
            content.imageURL = imageUrl
        }
        if let d = delegate {
            FBSDKShareDialog.showFromViewController(d, withContent: content, delegate: self)
        }
    }
    
    
    //MARK: - FBSDKSharingDelegate
    
    func sharer(sharer: FBSDKSharing!, didCompleteWithResults results: [NSObject : AnyObject]!) {
        #if DEBUG
            print("SHARING COMPLETED:: \(results)")
        #endif
        if let completionHandler = shareCompletionHandler {
            completionHandler(nil, JSObject(["message":"share completed"]))
        }
    }
    
    func sharer(sharer: FBSDKSharing!, didFailWithError error: NSError!) {
        #if DEBUG
            print("SHARING ERROR:: \(error)")
        #endif
        if let completionHandler = shareCompletionHandler {
            completionHandler(JSError(title: "Facebook plugin error: \(error.code)", description: error.localizedDescription, todo: error.localizedRecoverySuggestion), JSObject([:]))
        }
    }
    
    func sharerDidCancel(sharer: FBSDKSharing!) {
        #if DEBUG
            print("SHARING CANCELLED")
        #endif
        if let completionHandler = shareCompletionHandler {
            completionHandler(nil, JSObject([:]))
        }
    }
    
}