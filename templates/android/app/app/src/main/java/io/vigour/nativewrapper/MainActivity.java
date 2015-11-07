package io.vigour.nativewrapper;

import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.support.v7.app.ActionBarActivity;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.widget.TextView;

import org.xwalk.core.XWalkPreferences;
import org.xwalk.core.XWalkView;

import io.vigour.nativewrapper.plugin.NativeInterface;
import io.vigour.nativewrapper.plugin.core.PluginManager;

//-- start plugin imports
//-- end plugin imports

public class MainActivity extends ActionBarActivity {

    private XWalkView webview;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        XWalkPreferences.setValue(XWalkPreferences.REMOTE_DEBUGGING, BuildConfig.DEBUG);

        int delay = getResources().getInteger(R.integer.splashDuration);
        String url = getResources().getString(R.string.index_path);


        PluginManager pluginManager = new PluginManager();

        webview = (XWalkView) findViewById(R.id.webview);
        webview.addJavascriptInterface(new NativeInterface(this, webview, pluginManager), "NativeInterface");
        webview.load("file:///android_asset/" + url, null);

        registerPlugins(pluginManager);

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

    private void registerPlugins(PluginManager pluginManager) {
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (webview != null) {
            webview.pauseTimers();
            webview.onHide();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webview != null) {
            webview.resumeTimers();
            webview.onShow();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (webview != null) {
            webview.onDestroy();
        }
    }
}
