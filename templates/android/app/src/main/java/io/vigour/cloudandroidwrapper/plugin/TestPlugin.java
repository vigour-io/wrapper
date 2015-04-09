package io.vigour.cloudandroidwrapper.plugin;

import android.app.Activity;
import android.content.Context;
import android.os.Vibrator;
import android.util.Log;

import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;

import io.vigour.cloudandroidwrapper.MainActivity;

/**
 * Created by michielvanliempt on 09/04/15.
 */
public class TestPlugin extends VigourPlugin {
    private final Activity context;

    public TestPlugin(Activity context) {
        super("test");
        this.context = context;
    }

    public void vibrate() {
        Vibrator vibrator = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
        vibrator.vibrate(200);
    }

    public void log(Object message) {
        Log.i("TestPlugin", message.toString());
    }

    public String echo(Object message) {
        return message.toString();
    }

    public String getTime() {
        return DateTime.now().toString(DateTimeFormat.forStyle("LS"));
    }
}
