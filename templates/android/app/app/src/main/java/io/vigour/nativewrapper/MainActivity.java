package io.vigour.nativewrapper;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.res.Configuration;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Bundle;
import android.support.v7.app.ActionBarActivity;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.webkit.ValueCallback;
import android.widget.TextView;

import com.fasterxml.jackson.jr.ob.JSON;

import org.xwalk.core.XWalkPreferences;
import org.xwalk.core.XWalkUIClient;
import org.xwalk.core.XWalkView;
import org.xwalk.core.internal.XWalkSettings;
import org.xwalk.core.internal.XWalkViewBridge;

import java.io.IOException;
import java.lang.reflect.Method;

import io.vigour.nativewrapper.plugin.NativeInterface;
import io.vigour.nativewrapper.plugin.core.BridgeInterface;
import io.vigour.nativewrapper.plugin.core.PluginManager;

//-- start plugin imports
//-- end plugin imports

public class MainActivity extends ActionBarActivity {

    private static final String SET_VIGOUR_VAL =
            "console.log('setting window.vigour.native.webview = true')\n" +
            "if (!window.vigour) {\n" +
            "  window.vigour = {native: {webview: true}}\n" +
            "} else if (!window.vigour.native) {\n" +
            "  window.vigour.native = {webview: true}\n" +
            "} else {\n" +
            "  window.vigour.native.webview = true\n" +
            "}\n" +
            "console.log('after setting vigour = ' + JSON.stringify(window.vigour))\n";

    private XWalkView webview;
    private ViewGroup webViewContainer;
    private static String lastNetworkStatus = "";

    BridgeInterface bridgeInterface = new BridgeInterface() {
        @Override
        public void result(final int callId, final String error, final Object responseRaw) {
            final String response = stringify(responseRaw);
            Log.i("Sending result:", String.format("{ callId: %d, error: '%s', response: %s }", callId, error, response));
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    webview.evaluateJavascript(String.format("window.vigour.native.bridge.result(%d, '%s', %s)", callId, error, response), null);
                }
            });
        }

        @Override
        public void ready(final String error, final Object dataRaw, final String pluginId) {
            final String data = stringify(dataRaw);
            Log.i("Sending ready:", String.format("{ error: '%s', data: %s, pluginId: '%s' }", error, data, pluginId));
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    webview.evaluateJavascript(String.format("window.vigour.native.bridge.ready('%s', %s, '%s')", error, data, pluginId), null);
                }
            });
        }

        @Override
        public void receive(final String event, final Object dataRaw, final String pluginId) {
            final String data = stringify(dataRaw);
            Log.i("Sending receive:", String.format("{ event: '%s', data: %s, pluginId: '%s' }", event, data, pluginId));
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    webview.evaluateJavascript(String.format("window.vigour.native.bridge.receive('%s', %s, '%s')", event, data, pluginId), null);
                }
            });
        }
    };

    private String stringify(Object responseRaw) {
        try {
            return JSON.std.asString(responseRaw);
        } catch (IOException e) {
            return responseRaw.toString();
        }
    }

    private PluginManager pluginManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webview = (XWalkView) PersistentViewHolder.get();
        if (webview == null) {
            webview = buildWebView();
            PersistentViewHolder.set(webview);
        } else {
            ViewParent parent = webview.getParent();
            if (parent != null) {
                ((ViewGroup) parent).removeView(webview);
            }
        }
        webViewContainer = (ViewGroup) findViewById(R.id.webViewContainer);
        webViewContainer.addView(webview, new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        // show the version for debugging
        TextView versionView = (TextView) findViewById(R.id.versionView);
        // if (BuildConfig.DEBUG) {
        //     PackageInfo pInfo = null;
        //     try {
        //         String name = getPackageName();
        //         pInfo = getPackageManager().getPackageInfo(name, 0);
        //         String info = String.format("%s version %s (%d)", name, pInfo.versionName, pInfo.versionCode);
        //         versionView.setText(info);
        //     } catch (Exception e) {
        //         e.printStackTrace();
        //         versionView.setText("can't find version: " + e.getCause().getMessage());
        //     }
        // } else {
        versionView.setVisibility(View.GONE);
        // }

        registerReceiver(new BroadcastReceiver() {
            @Override public void onReceive(Context context, Intent intent) {
                final String status = getNetworkStatus();
                if (!lastNetworkStatus.equals(status)) {
                    Log.i("network", "status: " + status);

                    bridgeInterface.receive("change", String.format("{\"network\": \"%s\"}", status), "env");
                    lastNetworkStatus = status;
                }
            }
        }, new IntentFilter("android.net.conn.CONNECTIVITY_CHANGE"));
    }

    private String getNetworkStatus() {
        ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        final NetworkInfo activeNetworkInfo = cm.getActiveNetworkInfo();
        if (activeNetworkInfo == null) {
            return "none";
        }
        switch (activeNetworkInfo.getType()) {
            case ConnectivityManager.TYPE_ETHERNET:
                return "ethernet";
            case ConnectivityManager.TYPE_WIFI:
            case ConnectivityManager.TYPE_WIMAX:
                return "wifi";
            case ConnectivityManager.TYPE_MOBILE:
            case ConnectivityManager.TYPE_MOBILE_HIPRI:
            case ConnectivityManager.TYPE_MOBILE_MMS:
            case ConnectivityManager.TYPE_MOBILE_SUPL:
            case ConnectivityManager.TYPE_MOBILE_DUN:
                return "mobile";
            case ConnectivityManager.TYPE_BLUETOOTH:
                return "bluetooth";
        }
        return "none";
    }

    private XWalkView buildWebView() {
        XWalkPreferences.setValue(XWalkPreferences.REMOTE_DEBUGGING, BuildConfig.DEBUG);
        XWalkPreferences.setValue(XWalkPreferences.ANIMATABLE_XWALK_VIEW, true);

        pluginManager = new PluginManager(bridgeInterface);

        final XWalkView webview = new XWalkView(this, this);
        String userAgent = getResources().getString(R.string.uaAppendix);
        appendWebViewUserAgent(webview, userAgent);
        NativeInterface nativeInterface = new NativeInterface(this, webview, pluginManager, bridgeInterface);
        webview.addJavascriptInterface(nativeInterface, "NativeInterface");

        String url = getResources().getString(R.string.index_path);
        webview.load("file:///android_asset/" + url, null);
        webview.setUIClient(new XWalkUIClient(webview) {
            @Override public void onPageLoadStarted(XWalkView view, String url) {
                super.onPageLoadStarted(view, url);
                webview.evaluateJavascript(SET_VIGOUR_VAL, new ValueCallback<String>() {
                    @Override public void onReceiveValue(String value) {
                        Log.d("js", value);
                    }
                });
            }
        });

        registerPlugins(pluginManager, webview);
        return webview;
    }

    private void registerPlugins(PluginManager pluginManager, XWalkView webview) {
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        pluginManager.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (webview != null) {
            bridgeInterface.receive("pause", "pause", "env");
            webview.pauseTimers();
            webview.onHide();
        }
        pluginManager.onPause();
    }

    @Override public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        pluginManager.onResume();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webview != null) {
            bridgeInterface.receive("resume", "resume", "env");
            webview.resumeTimers();
            webview.onShow();
        }
        pluginManager.onResume();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        Log.i("main", "ondestroy");
        if (webview != null) {
            webview.onDestroy();
            PersistentViewHolder.set(null);
            webview = null;
        }
    }

    @Override protected void onStop() {
        super.onStop();
        pluginManager.onStop();
    }

    @Override protected void onStart() {
        super.onStart();
        if (webview != null && pluginManager != null) {
            pluginManager.onStart();
        }
    }

    @Override public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            bridgeInterface.receive("button", "back", "env");
            return true;
        } else if (keyCode == KeyEvent.KEYCODE_VOLUME_DOWN) {
            bridgeInterface.receive("button", "volDown", "env");
        } else if (keyCode == KeyEvent.KEYCODE_VOLUME_UP) {
            bridgeInterface.receive("button", "volUp", "env");
        } else if (keyCode == KeyEvent.KEYCODE_MUTE) {
            bridgeInterface.receive("button", "volMute", "env");
        }
        return super.onKeyDown(keyCode, event);
    }

    private void appendWebViewUserAgent(XWalkView webView, String appendix) {
        try {
            Method ___getBridge = XWalkView.class.getDeclaredMethod("getBridge");
            ___getBridge.setAccessible(true);
            XWalkViewBridge xWalkViewBridge = null;
            xWalkViewBridge = (XWalkViewBridge) ___getBridge.invoke(webView);
            XWalkSettings xWalkSettings = xWalkViewBridge.getSettings();
            String uaString = xWalkSettings.getUserAgentString() + " " + appendix;
            Log.d("ua", "setting ua string to: " + uaString);
            xWalkSettings.setUserAgentString(uaString);
        } catch (Exception e) {
            // Could not set user agent
            e.printStackTrace();
        }
    }

}
