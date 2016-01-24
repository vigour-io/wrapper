//
//  Chromecast.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 09/04/15.
//  Copyright (c) 2016 Vigour.io. All rights reserved.
//

import Foundation


enum ChromecastMethod: String {
    case Init="init", StartCasting="startCasting", StopCasting="stopCasting"
}

class Chromecast:NSObject, VigourPluginProtocol, GCKDeviceScannerListener, GCKDeviceManagerDelegate {
    
    private var deviceScanner:GCKDeviceScanner?
    
    private var deviceManager:GCKDeviceManager?
    
    private var selectedDevice:GCKDevice?
    
    private var receiverAppId:String?
    
    private var castingActionCompletionHandler: PluginResult?
    
    
    //MARK: - VigourPluginProtocol
    
    static let sharedInstance = Chromecast()
    
    static let pluginId = "chromecast"
    
    weak var delegate: VigourBridgeViewController?
    
    func callMethodWithName(name: String, andArguments args: NSDictionary?, completionHandler: PluginResult) throws {
        guard let method = ChromecastMethod.init(rawValue: name)
            else {
                throw VigourBridgeError.PluginError("Unsupported method!", pluginId: Chromecast.pluginId)
        }
        switch(method) {
        case .Init:
            if let appId = args!["appId"] as? String where appId=="default" {
                startScanning(kGCKMediaDefaultReceiverApplicationID)
                completionHandler(nil, JSValue(true))
            }
            else if let appId = args!["appId"] as? String {
                startScanning(appId)
                completionHandler(nil, JSValue(true))
            }
            else {
                completionHandler(JSError(title:"Chromecast error", description: "An app id is required", todo:"provide the default value or an existing id"), JSValue(false))
            }
        case .StartCasting:
            if let id = args!["deviceId"] as? String {
                castingActionCompletionHandler = completionHandler
                connectToDeviceById(id)
            }
        case .StopCasting:
            castingActionCompletionHandler = completionHandler
            disconnectFromCurrentDevice()
        }

    }
    
    func onReady() throws -> JSValue {
        return JSValue([Chromecast.pluginId:"ready"])
    }
    
    static func instance() -> VigourPluginProtocol {
        return Chromecast.sharedInstance
    }
    
    
    
    
    //MARK: - Plugin methods
    
    private func startScanning(identifier: String) {

        let filterCriteria = GCKFilterCriteria(forAvailableApplicationWithID: identifier)
        
        /// Initialize device scanner
        deviceScanner = GCKDeviceScanner(filterCriteria: filterCriteria)
        if let deviceScanner = deviceScanner {
            deviceScanner.addListener(self)
            deviceScanner.startScan()
            deviceScanner.passiveScan = true
            receiverAppId = identifier
        }
    }
    
    private func deviceListChanged(device: GCKDevice, online: Bool) {
        let event = online ? "deviceJoined" : "deviceLeft"
        if let d = delegate {
            d.vigourBridge.sendJSMessage(
                VigourBridgeSendMessage.Receive(
                    error: nil,
                    event: event,
                    message: JSValue(
                        [
                            "id":device.deviceID,
                            "name":device.friendlyName == nil ? "" : device.friendlyName,
                            "modelName":device.modelName == nil ? "" : device.modelName,
                            "manufacturer":(device.manufacturer == nil) ? "" : device.manufacturer
                        ]
                    ),
                    pluginId: Chromecast.pluginId
                )
            )
        }
    }
    
    private func connectToDeviceById(id: String) {
        
        if let d = deviceScanner {
            _ = d.devices.filter {
                    return $0.deviceID == id
                }.map { [weak self] device in
                    self?.selectedDevice = device as? GCKDevice
                }
        }
        
        if (selectedDevice == nil) {
            return
        }
        
        let identifier = NSBundle.mainBundle().bundleIdentifier
        deviceManager = GCKDeviceManager(device: selectedDevice, clientPackageName: identifier)
        deviceManager!.delegate = self
        deviceManager!.connect()
    }
    
    private func disconnectFromCurrentDevice() {
        if let d = deviceManager {
            d.disconnect()
        }
        else if let completionHandler = castingActionCompletionHandler {
            completionHandler(JSError(title:"Chromecast error", description: "No session to stop", todo:"Start session first!"), JSValue(false))
        }
    }
    
    private func deviceDisconnected() {
        selectedDevice = nil
        deviceManager = nil
        castingActionCompletionHandler = nil
    }
    
    private func sendError(error: NSError) {
        if let completionHandler = castingActionCompletionHandler {
            completionHandler(JSError(title:"Chromecast error", description: error.localizedDescription, todo:error.localizedRecoverySuggestion ?? ""), JSValue(false))
        }
    }
    
    
    // MARK: GCKDeviceScannerListener
    
    func deviceDidComeOnline(device: GCKDevice!) {
        #if DEBUG
        print("Device found: \(device.friendlyName)")
        #endif
        deviceListChanged(device, online: true)
    }
    
    func deviceDidGoOffline(device: GCKDevice!) {
        #if DEBUG
        print("Device went away: \(device.friendlyName)")
        #endif
        deviceListChanged(device, online: false)
    }
    
    // MARK: GCKDeviceManagerDelegate
    
    func deviceManagerDidConnect(deviceManager: GCKDeviceManager!) {
        #if DEBUG
        print("Connected.");
        #endif
        deviceManager.launchApplication(receiverAppId);
    }
    
    func deviceManager(deviceManager: GCKDeviceManager!, didConnectToCastApplication applicationMetadata: GCKApplicationMetadata!, sessionID: String!, launchedApplication: Bool) {
        #if DEBUG
        print("Application has launched.")
        #endif
        if let completionHandler = castingActionCompletionHandler {
            completionHandler(nil, JSValue(["sessionId":sessionID]))
            castingActionCompletionHandler = nil
        }
    }
    
    func deviceManager(deviceManager: GCKDeviceManager!, didFailToConnectWithError error: NSError!) {
        sendError(error)
        deviceDisconnected()
    }
    
    func deviceManager(deviceManager: GCKDeviceManager!, didFailToStopApplicationWithError error: NSError!) {
        #if DEBUG
            print("Did fail to stop: \(error.localizedDescription)")
        #endif
    }
    
    func deviceManagerDidStopApplication(deviceManager: GCKDeviceManager!) {
        #if DEBUG
            print("Did stop")
        #endif
    }
    
    func deviceManager(deviceManager: GCKDeviceManager!, didSuspendConnectionWithReason reason: GCKConnectionSuspendReason) {
        #if DEBUG
            print("Suspend")
        #endif
    }
    
    func deviceManager(deviceManager: GCKDeviceManager!, didDisconnectFromApplicationWithError error: NSError!) {
        if (error != nil) {
            sendError(error)
        }
        else {
            if let completionHandler = castingActionCompletionHandler {
                completionHandler(nil, JSValue(true))
            }
        }
        deviceDisconnected()
    }
    
    func deviceManager(deviceManager: GCKDeviceManager!, didDisconnectWithError error: NSError!) {
        if (error != nil) {
            sendError(error)
        }
        else {
            if let completionHandler = castingActionCompletionHandler {
                completionHandler(nil, JSValue(true))
            }
        }
        deviceDisconnected()
    }
    
}