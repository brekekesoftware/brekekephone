package com.brekeke.phonedev.lpc;

import android.app.ActivityManager;
import android.content.ComponentName;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.IBinder;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import java.util.Map;
import org.json.JSONObject;

public class LpcUtils {
  public static Intent putConfigToIntent(
      String host, int port, String token, String userName, String tlsKeyHash, Intent i) {
    i.putExtra("token", token);
    i.putExtra("username", userName);
    i.putExtra("host", host);
    i.putExtra("port", port);
    i.putExtra("tlsKeyHash", tlsKeyHash);
    return i;
  }

  // construct and load our normal React JS code bundle
  public static void createReactContextInBackground(ReactApplication r) {
    ReactInstanceManager rim = r.getReactNativeHost().getReactInstanceManager();
    if (!rim.hasStartedCreatingInitialContext()) {
      rim.createReactContextInBackground();
    }
  }

  public static boolean checkAppInBackground() {
    if (!BrekekeLpcService.isServiceStarted) {
      return false;
    }

    ActivityManager.RunningAppProcessInfo myProcess = new ActivityManager.RunningAppProcessInfo();
    ActivityManager.getMyMemoryState(myProcess);
    return myProcess.importance != ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND;
  }

  public static final ServiceConnection connection =
      new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName className, IBinder service) {}

        @Override
        public void onServiceDisconnected(ComponentName arg0) {}
      };

  public static String convertMapToString(Map<String, String> m) {
    JSONObject jsonObject = new JSONObject(m);
    return jsonObject.toString();
  }

  public static class LpcCallback {
    public static callbackInterface cb;

    public interface callbackInterface {
      void getStateServer(Boolean b);
    }

    public static void setLpcCallback(callbackInterface c) {
      cb = c;
    }
  }
}
