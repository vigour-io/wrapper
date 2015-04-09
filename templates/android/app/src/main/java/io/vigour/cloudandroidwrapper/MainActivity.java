package io.vigour.cloudandroidwrapper;

import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.support.v7.app.ActionBarActivity;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.TextView;

import org.xwalk.core.XWalkPreferences;
import org.xwalk.core.XWalkView;

import io.vigour.cloudandroidwrapper.plugin.NativeInterface;
import io.vigour.cloudandroidwrapper.plugin.PluginManager;
import io.vigour.cloudandroidwrapper.plugin.StatusBarPlugin;
import io.vigour.cloudandroidwrapper.plugin.TestPlugin;


public class MainActivity extends ActionBarActivity {

    private XWalkView webview;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        XWalkPreferences.setValue(XWalkPreferences.REMOTE_DEBUGGING, true);

        webview = (XWalkView) findViewById(R.id.webview);

        PluginManager pluginManager = new PluginManager();
        pluginManager.register(new StatusBarPlugin(this, webview));
        pluginManager.register(new TestPlugin(this));

        webview.addJavascriptInterface(new NativeInterface(this, webview, pluginManager), "NativeInterface");
        webview.load("file:///android_asset/index.html", null);

        // show the version for debugging
        TextView versionView = (TextView) findViewById(R.id.versionView);
        if (BuildConfig.DEBUG) {
            PackageInfo pInfo = null;
            try {
                String name = getPackageName();
                pInfo = getPackageManager().getPackageInfo(name, 0);
                String info = String.format("%s version %s (%d)", name, pInfo.versionName, pInfo.versionCode);
                versionView.setText(info);
            } catch (PackageManager.NameNotFoundException e) {
                e.printStackTrace();
                versionView.setText("can't find version: " + e.getCause().getMessage());
            }
        } else {
            versionView.setVisibility(View.GONE);
        }
    }


    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        return super.onOptionsItemSelected(item);
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
