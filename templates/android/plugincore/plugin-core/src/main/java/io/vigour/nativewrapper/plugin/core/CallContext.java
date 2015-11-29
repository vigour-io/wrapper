package io.vigour.nativewrapper.plugin.core;

import java.lang.reflect.InvocationTargetException;

import rx.Observable;
import rx.functions.Action1;

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
            Object result = function.run(arguments);
            if (result == null) {
                respond("");
            } else if (result instanceof String) {
                respond((String) result);
            } else if (result instanceof Observable) {
                ((Observable)result).subscribe(new Action1() {
                    @Override public void call(Object o) {
                        if (o == null) {
                            o = "";
                        }
                        respond(o.toString());
                    }
                }, new Action1<Throwable>() {
                    @Override public void call(Throwable throwable) {
                        if (throwable == null) {
                            error("");
                        }
                        error(throwable.getMessage());
                    }
                });
            } else {
                error("native call type not recognized: " + result.getClass().getSimpleName());
            }
        } catch (Exception e) {
            e.printStackTrace();
            if (e instanceof InvocationTargetException) {
                e = (Exception) e.getCause();
            }
            error(e.toString());
        }
    }

    public void error(String errorMessage) {
        bridge.result(callId, errorMessage, "");
    }

    public void respond(String response) {
        bridge.result(callId, "", response);
    }
}
