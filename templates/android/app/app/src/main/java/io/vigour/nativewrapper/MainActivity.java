package io.vigour.nativewrapper;

import android.content.Intent;
import android.content.pm.PackageInfo;
import android.os.Bundle;
import android.support.v7.app.ActionBarActivity;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.widget.TextView;

import org.xwalk.core.XWalkPreferences;
import org.xwalk.core.XWalkView;

import io.vigour.nativewrapper.plugin.NativeInterface;
import io.vigour.nativewrapper.plugin.core.BridgeInterface;
import io.vigour.nativewrapper.plugin.core.PluginManager;

//-- start plugin imports
//-- end plugin imports

public class MainActivity extends ActionBarActivity {

    private XWalkView webview;
    private ViewGroup webViewContainer;

    BridgeInterface bridgeInterface = new BridgeInterface() {
        @Override
        public void result(final int callId, final String error, final String response) {
            Log.i("Sending result:", String.format("{ callId: %d, error: '%s', response: '%s' }", callId, error, response));
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    webview.evaluateJavascript(String.format("window.vigour.native.bridge.result(%d, '%s', '%s')", callId, error, response), null);
                }
            });
        }

        @Override
        public void ready(final String error, final String response, final String pluginId) {
            Log.i("Sending ready:", String.format("{ error: '%s', response: '%s', pluginId: '%s' }", error, response, pluginId));
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    webview.evaluateJavascript(String.format("window.vigour.native.bridge.ready('%s', '%s', '%s')", error, response, pluginId), null);
                }
            });
        }

        @Override
        public void receive(final String error, final String message, final String pluginId) {
            Log.i("Sending receive:", String.format("{ error: '%s', message: '%s', pluginId: '%s' }", error, message, pluginId));
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    webview.evaluateJavascript(String.format("window.vigour.native.bridge.receive('%s', '%s', '%s')", error, message, pluginId), null);
                }
            });
        }
    };
    private PluginManager pluginManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webview = (XWalkView) PersistentViewHolder.get();
        if (webview == null) {
            webview = buildWebView();
            PersistentViewHolder.set(webview);
        }
        webViewContainer = (ViewGroup) findViewById(R.id.webViewContainer);
        webViewContainer.addView(webview, new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        // show the version for debugging
        TextView versionView = (TextView) findViewById(R.id.versionView);
        if (BuildConfig.DEBUG) {
            PackageInfo pInfo = null;
            try {
                String name = getPackageName();
                pInfo = getPackageManager().getPackageInfo(name, 0);
                String info = String.format("%s version %s (%d)", name, pInfo.versionName, pInfo.versionCode);
                versionView.setText(info);
            } catch (Exception e) {
                e.printStackTrace();
                versionView.setText("can't find version: " + e.getCause().getMessage());
            }
        } else {
            versionView.setVisibility(View.GONE);
        }
    }

    private XWalkView buildWebView() {
        XWalkPreferences.setValue(XWalkPreferences.REMOTE_DEBUGGING, BuildConfig.DEBUG);
        XWalkPreferences.setValue(XWalkPreferences.ANIMATABLE_XWALK_VIEW, true);

        pluginManager = new PluginManager(bridgeInterface);

        XWalkView webview = new XWalkView(this, this);
        NativeInterface nativeInterface = new NativeInterface(this, webview, pluginManager, bridgeInterface);
        webview.addJavascriptInterface(nativeInterface, "NativeInterface");

        String url = getResources().getString(R.string.index_path);
        webview.load("file:///android_asset/" + url, null);

        registerPlugins(pluginManager);
        return webview;
    }

    private void registerPlugins(PluginManager pluginManager) {
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        pluginManager.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (webview != null) {
            bridgeInterface.receive("", "pause", "");
            webview.pauseTimers();
            webview.onHide();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webview != null) {
            bridgeInterface.receive("", "resume", "");
            webview.resumeTimers();
            webview.onShow();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        Log.i("main", "ondestroy");
        if (webview != null) {
            webview.onDestroy();
        }
    }
}
