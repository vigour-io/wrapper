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
                webView.evaluateJavascript(String.format("receive_android_result(%d, '%s')", id, message), null);
            }
        });
    }

    private void respondError(final int id, final String error) {
        context.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                webView.evaluateJavascript(String.format("receive_android_error(%d, '%s')", id, error), null);
            }
        });
    }
}
