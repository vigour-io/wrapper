//
//  Open.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 19/11/15.
//  Copyright © 2015 RxSwift. All rights reserved.
//

import Foundation

struct OpenURLValue {
    let urlString:String
}

enum VigourOpenMethod: String {
    case Open="open", Init="init"
}

class Open: NSObject, VigourPluginProtocol {

    private static let sharedInstance = Open()

    var shareCompletionHandler:PluginResult?

    static let pluginId = "open"

    weak var delegate: VigourBridgeViewController? {
        didSet {
            #if DEBUG
                print("delegate set for \(Open.pluginId)")
            #endif
        }
    }

    static func instance() -> VigourPluginProtocol {
        return sharedInstance
    }

    func callMethodWithName(name: String, andArguments args: NSDictionary?, completionHandler: PluginResult) throws {
        if let method = VigourOpenMethod(rawValue: name) {
            switch method {
            case .Init:
                completionHandler(nil, JSValue([
                    "name": "outside",
                  ]
                  )
                )

            case .Open:

                if let link = args?.objectForKey("url") as? String {

                    let url = OpenURLValue(
                        urlString: link
                    )
                    open(url, completionHandler:completionHandler)

                }
                else {
                    completionHandler(JSError(title: "Open needs a link", description: "No link found to open", todo: "`open.url.val = <url>`?"), JSValue([:]))
                }


            }
        }
        else {
            completionHandler(JSError(title: "Open method error", description: "No valid method name was matched for the Open plugin", todo: "Check if the right method name is used?"), JSValue([:]))
        }

    }

    func onReady() throws -> JSValue {

        //init stuff

        return JSValue([Open.pluginId:"ready"])
    }

    //Methods

    private func login(scope:[String], completionHandler: PluginResult) {

        let loginMgr = FBSDKLoginManager()

        //The view controller to present from. If nil, the topmost view controller will be automatically determined as best as possible.
        loginMgr.logInWithReadPermissions(scope, fromViewController: nil, handler: { (result, error) -> Void in
            if error != nil {
                completionHandler(JSError(title: "Open plugin error: \(error.code)", description: error.localizedDescription, todo: error.localizedRecoverySuggestion), JSValue([:]))
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

    private func logout(completionHandler: PluginResult) {
        let loginMgr = FBSDKLoginManager()
        loginMgr.logOut()
        FBSDKAccessToken.setCurrentAccessToken(nil)
        completionHandler(nil, JSValue([:]))
    }

    private func open(url: OpenURLValue, completionHandler: PluginResult) {
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

}
