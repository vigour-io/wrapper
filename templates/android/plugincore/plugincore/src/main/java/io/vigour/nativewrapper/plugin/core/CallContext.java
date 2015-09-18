package io.vigour.nativewrapper.plugin.core;

/**
 * Created by michielvanliempt on 08/04/15.
 */
public class CallContext {
    int callId;
    String pluginId;
    String functionName;
    Object arguments;
    BridgeInterface bridge;

    public CallContext(int callId, String pluginId, String functionName, Object arguments, BridgeInterface bridge) {
        this.callId = callId;
        this.pluginId = pluginId;
        this.functionName = functionName;
        this.arguments = arguments;
        this.bridge = bridge;
    }

    public void execute(PluginFunction function) {
        try {
            respond(function.run(arguments));
        } catch (Exception e) {
            e.printStackTrace();
            error(e.toString());
        }
    }

    public void error(String errorMessage) {
        bridge.respond(callId, errorMessage, null);
    }

    public void respond(String response) {
        bridge.respond(callId, null, response);
    }
}
