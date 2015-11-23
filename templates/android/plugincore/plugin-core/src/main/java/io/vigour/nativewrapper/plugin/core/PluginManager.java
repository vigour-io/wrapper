package io.vigour.nativewrapper.plugin.core;

import java.util.Map;
import java.util.TreeMap;

/**
 * Created by michielvanliempt on 08/04/15.
 */
public class PluginManager {

    BridgeEvents bridgeEventInterface;

    private Map<String, Plugin> plugins = new TreeMap<>();

    public PluginManager(BridgeEvents bridgeEventInterface) {
        this.bridgeEventInterface = bridgeEventInterface;
    }

    public void register(Plugin plugin) {
        plugins.put(plugin.getName(), plugin);
        plugin.setEventInterface(bridgeEventInterface);
    }

    public void execute(CallContext context) {
        Plugin plugin = plugins.get(context.pluginId);

        if (plugin == null) {
            context.error(String.format("plugin %s not registered on native side", context.pluginId));
        }

        PluginFunction function = plugin.getFunction(context.functionName);
        if (function == null) {
            context.error(String.format("function %s not found in plugin %s", context.functionName, context.pluginId));
        }

        context.execute(function);
    }

    public void notifyReady(BridgeInterface bridge) {
        for (Plugin plugin : plugins.values()) {
            try {
                plugin.setEventInterface(bridge);
                String message = plugin.getReadyMessage();
                bridge.ready("", message, plugin.getName());
            } catch (Exception e) {
                bridge.ready(e.getMessage(), "", plugin.getName());
            }
        }

    }

    public void onActivityResult(int requestCode, int resultCode, Object data) {
        for (Plugin plugin : plugins.values()) {
            if (plugin instanceof ActivityResultListener) {
                ((ActivityResultListener) plugin).onActivityResult(requestCode, resultCode, data);
            }
        }
    }
}
