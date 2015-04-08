package io.vigour.cloudandroidwrapper;

import android.app.ActionBar;
import android.app.Activity;
import android.os.Build;
import android.view.View;
import android.view.WindowManager;

import io.vigour.cloudandroidwrapper.plugin.PluginFunction;
import io.vigour.cloudandroidwrapper.plugin.VigourPlugin;

/**
 * Created by michielvanliempt on 08/04/15.
 */
public class ScrollbarPlugin extends VigourPlugin {

    private final Activity context;

    public ScrollbarPlugin(Activity activity) {
        this.context = activity;
    }

    void hide(Object ignored) {
        if (Build.VERSION.SDK_INT < 16) {
            context.getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                                         WindowManager.LayoutParams.FLAG_FULLSCREEN);
        } else {
            // Hide the status bar.
            View decorView = context.getWindow().getDecorView();
            int uiOptions = View.SYSTEM_UI_FLAG_FULLSCREEN;
            decorView.setSystemUiVisibility(uiOptions);

            // Remember that you should never show the action bar if the
            // status bar is hidden, so hide that too if necessary.
            ActionBar actionBar = context.getActionBar();
            actionBar.hide();
        }
    }


}
