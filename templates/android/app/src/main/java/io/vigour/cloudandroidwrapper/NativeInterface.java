package io.vigour.cloudandroidwrapper;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.os.Vibrator;
import android.util.Log;

import com.fasterxml.jackson.jr.ob.JSON;

import org.xwalk.core.JavascriptInterface;
import org.xwalk.core.XWalkView;

import java.io.IOException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;


/**
 * Created by michielvanliempt on 25/03/15.
 */
public class NativeInterface {
    private final Activity context;
    private final XWalkView webView;
    private static int callId = 0;

    public NativeInterface(Activity context, XWalkView webView) {
        this.context = context;
        this.webView = webView;
    }

    @JavascriptInterface
    public void send(String params) {
        Log.d("NativeInterface/send", params);
        try {
            Object[] array = JSON.std.arrayFrom(params);
            int id = -1;
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
            respondError(-1, "couldn't parse params: " + params + "\nbecause:\n" + e.getMessage());
        }
    }

    private void handleJsMessage(int callId, String pluginId, String functionName, Object arguments) {
        Log.i("NativeInterface/handle", String.format("calling %s from plugin %s with arguments %s", functionName, pluginId, arguments.toString()));
        if (callId % 2 == 0) {
            respondError(callId, "I don't like even numbers... >-(");
        } else {
            respond(callId, "I DO like even numbers! :D");
        }
    }

    @JavascriptInterface
    public void vibrate(String params) {
        Vibrator vibrator = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
        vibrator.vibrate(200);
    }

    private void respond(final int id, final String message) {
        context.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                webView.evaluateJavascript(String.format("receiveAndroidResult(%d, '%s')", id, message), null);
            }
        });
    }

    private void respondError(final int id, final String error) {
        context.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                webView.evaluateJavascript(String.format("receiveAndroidError(%d, '%s')", id, error), null);
            }
        });
    }
}
