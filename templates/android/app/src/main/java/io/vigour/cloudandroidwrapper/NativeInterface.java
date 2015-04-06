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
    public void log(String params) {
        Log.d("NativeInterface", params);
    }

    @JavascriptInterface
    public void vibrate(String params) {
        Vibrator vibrator = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
        vibrator.vibrate(200);
    }

    @JavascriptInterface
    public int immediate(String params) {
        final int id = callId++;
        context.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                webView.evaluateJavascript("result(\""+ id +"\")", null);
            }
        });
        return id;
    }

    @JavascriptInterface
    public int slow(String params) {
        final int id = callId++;
        webView.postDelayed(new Runnable() {
            @Override
            public void run() {
                webView.evaluateJavascript("result(\""+ id +"\")", null);
            }
        }, 1200);
        return id;
    }

    @JavascriptInterface
    public int fast(String params) {
        final int id = callId++;
        webView.postDelayed(new Runnable() {
            @Override
            public void run() {
                webView.evaluateJavascript("result(\""+ id +"\")", null);
            }
        }, 300);
        return id;
    }

    @JavascriptInterface
    public String getInterface() {
        try {
            List<FunctionInfo> interfaceDescription = new ArrayList<>();
            Method[] methods = getClass().getMethods();
            for (Method m : methods) {
                if (m.getDeclaringClass() != getClass()) {
                    continue;
                }
                interfaceDescription.add(new FunctionInfo(m));
            }

            return JSON.std.asString(interfaceDescription);
        } catch (Exception e) {
            e.printStackTrace();
            return "[]";
        }
    }
}
