package io.vigour.cloudandroidwrapper.plugin;

import android.app.Activity;
import android.content.Context;
import android.os.Vibrator;
import android.util.Log;

import com.fasterxml.jackson.jr.ob.JSON;

import org.xwalk.core.JavascriptInterface;
import org.xwalk.core.XWalkView;

import java.io.IOException;


/**
 * Created by michielvanliempt on 25/03/15.
 */
public class NativeInterface {
    private final Activity context;
    private final XWalkView webView;
    private PluginManager pluginManager;
    private static int callId = 0;

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
                handleJsMessage(id, (String)array[1], (String)array[2], array[3]);
            } else {
                respondError(id, "wrong number of arguments, we expect 4: " + params);
            }
        } catch (IOException e) {
            respondError(id, "exception handling message: " + params + " because: " + e.getMessage().replace('\'', '"').replace("\n", ""));
        }
    }

    private void handleJsMessage(int callId, String pluginId, String functionName, Object arguments) {
        Log.i("NativeInterface/handle", String.format("calling %s from plugin %s with arguments %s", functionName, pluginId, arguments.toString()));
        pluginManager.execute(new CallContext(callId, pluginId, functionName, arguments, this));
    }

    void respond(final int id, final String message) {
        context.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                webView.evaluateJavascript(String.format("receiveAndroidResult(%d, '%s')", id, message), null);
            }
        });
    }

    void respondError(final int id, final String error) {
        context.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                webView.evaluateJavascript(String.format("receiveAndroidError(%d, '%s')", id, error), null);
            }
        });
    }
}
