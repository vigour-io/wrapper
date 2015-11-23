package io.vigour.nativewrapper.plugin.core;

import java.lang.reflect.Method;
import java.util.AbstractMap;
import java.util.TreeMap;

/**
 * Created by michielvanliempt on 08/04/15.
 */
public class Plugin {
    private String name;
    private AbstractMap<String, PluginFunction> functions = new TreeMap<>();
    private BridgeEvents eventInterface;

    public Plugin(String name) {
        this.name = name;
        for (Method m : getClass().getMethods()) {
            if (m.getDeclaringClass() == getClass() &&
                    m.getParameterTypes().length < 2) {
                register(new ReflectivePluginFunction(m.getName(), m, this));
            }
        }
    }

    protected void sendEvent(String message) {
        eventInterface.receive("", message, name);
    }

    protected void sendError(String message) {
        eventInterface.error(message, name);
    }

    public String getName() {
        return name;
    }

    public String getReadyMessage() {
        return "";
    }

    public PluginFunction getFunction(String functionName) {
        return functions.get(functionName);
    }

    protected void register(PluginFunction function) {
        functions.put(function.getName(), function);
    }

    public void setEventInterface(BridgeEvents eventInterface) {
        this.eventInterface = eventInterface;
    }
}
