package io.vigour.nativewrapper.plugin;

import android.app.Activity;
import android.util.Log;

import com.fasterxml.jackson.jr.ob.JSON;

import org.xwalk.core.JavascriptInterface;
import org.xwalk.core.XWalkView;

import java.io.IOException;

import io.vigour.nativewrapper.plugin.core.BridgeInterface;
import io.vigour.nativewrapper.plugin.core.CallContext;
import io.vigour.nativewrapper.plugin.core.PluginManager;


/**
 * Created by michielvanliempt on 25/03/15.
 */
public class NativeInterface {
    private final Activity context;
    private final XWalkView webView;
    private PluginManager pluginManager;

    public NativeInterface(Activity context, XWalkView webView, PluginManager pluginManager) {
        this.context = context;
        this.webView = webView;
        this.pluginManager = pluginManager;
    }

    @JavascriptInterface
    public void send(String params) {
        Log.d("NativeInterface/send", params);
        int id = -1;
        try {
            Object[] array = JSON.std.arrayFrom(params);
            if (array.length == 0) {
                throw new IOException("we need 4 arguments, first needs to be an integer");
            }

            Object first = array[0];
            if (first instanceof Integer) {
                id = (Integer) first;
            } else if (first instanceof String) {
                id = Integer.valueOf((String) first);
            } else {
                throw new IOException("first argument is not a number (or parsable string): " + params);
            }

            if (array.length == 4
                && array[1] instanceof String
                && array[2] instanceof String) {
                handleJsMessage(id, (String) array[1], (String) array[2], array[3]);
            } else {
                if (array.length != 4) {
                    bridgeInterface.result(id, "wrong number of arguments, we expect 4: " + params, null);
                } else {
                    bridgeInterface.result(id, "2nd and 3rd params must be strings: " + params, null);
                }
            }
        } catch (IOException e) {
            String errorMessage = "exception handling message: " + params + " because: " + e.getMessage();
            errorMessage = errorMessage.replace('\'', '"').replace("\n", "");
            bridgeInterface.error(errorMessage, "");
        }
    }

    private void handleJsMessage(int callId, String pluginId, String functionName, Object arguments) {
        Log.i("NativeInterface/handle", String.format("calling %s from plugin %s with arguments %s", functionName, pluginId, arguments.toString()));
        pluginManager.execute(new CallContext(callId, pluginId, functionName, arguments, bridgeInterface));
    }

    private BridgeInterface bridgeInterface = new BridgeInterface() {
        @Override
        public void result(final int callId, final String error, final String response) {
            context.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    webView.evaluateJavascript(String.format("window.vigour.native.bridge.result(%d, '%s', '%s')", callId, error, response), null);
                }
            });
        }

        @Override
        public void error(final String error, final String pluginId) {
            context.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    webView.evaluateJavascript(String.format("window.vigour.native.bridge.error('%s', '%s')", error, pluginId), null);
                }
            });
        }

        @Override
        public void ready(final String error, final String response, final String pluginId) {
            context.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    webView.evaluateJavascript(String.format("window.vigour.native.bridge.ready('%s', '%s', '%s')", error, response, pluginId), null);
                }
            });
        }

        @Override
        public void receive(final String error, final String message, final String pluginId) {
            context.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    webView.evaluateJavascript(String.format("window.vigour.native.bridge.receive('%s', '%s', '%s')", error, message, pluginId), null);
                }
            });
        }

    };
}
