package io.vigour.cloudandroidwrapper.plugin;

/**
 * Created by michielvanliempt on 08/04/15.
 */
public class CallContext {
    int callId;
    String pluginId;
    String functionName;
    Object arguments;
    NativeInterface nativeInterface;

    public CallContext(int callId, String pluginId, String functionName, Object arguments, NativeInterface nativeInterface) {
        this.callId = callId;
        this.pluginId = pluginId;
        this.functionName = functionName;
        this.arguments = arguments;
        this.nativeInterface = nativeInterface;
    }

    public void execute(PluginFunction function) {
        try {
            respond(function.run(arguments));
        } catch (Exception e) {
            error(e.getMessage());
        }
    }

    public void error(String errorMessage) {
        nativeInterface.respondError(callId, errorMessage);
    }

    public void respond(String response) {
        nativeInterface.respond(callId, response);
    }
}
