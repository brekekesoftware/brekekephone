package com.brekeke.phonedev.push_notification;

import static com.facebook.react.bridge.UiThreadUtil.runOnUiThread;

import com.brekeke.phonedev.BrekekeUtils;
import com.brekeke.phonedev.lpc.LpcUtils;
import com.brekeke.phonedev.utils.Ctx;
import com.brekeke.phonedev.utils.Emitter;
import com.facebook.react.ReactApplication;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.google.firebase.messaging.RemoteMessage;
import com.wix.reactnativenotifications.fcm.FcmInstanceIdListenerService;
import java.util.ArrayList;
import org.json.JSONArray;

// custom push notification
public class BrekekeMessagingService extends FcmInstanceIdListenerService {
  @Override
  public void onMessageReceived(RemoteMessage m) {
    Ctx.wakeFromPn(this);

    if (!BrekekeUtils.checkNotificationPermission()) {
      Emitter.error("onMessageReceived", "!checkNotificationPermission");
      return;
    }
    if (!BrekekeUtils.checkReadPhonePermission()) {
      Emitter.emit("phonePermission", "");
      Emitter.error("onMessageReceived", "!checkReadPhonePermission");
      return;
    }

    // it should close the default dialer permission popup when there is an incoming call
    BrekekeUtils.resolveDefaultDialer("The call is incoming");
    BrekekeUtils.onFcmMessageReceived(m.getData());

    // cache for initial notifications
    if (initialNotifications == null) {
      initialNotifications = new ArrayList<String>();
    }
    try {
      initialNotifications.add(ReactNativeJson.convertMapToJson(parse(m)).toString());
    } catch (Exception e) {
      Emitter.error("initialNotifications.add", e.getMessage());
    }

    // build a new RemoteMessage with the updated data for callkeepAt and callkeepUuid
    var m2 =
        new RemoteMessage.Builder(m.getFrom())
            .setMessageId(m.getMessageId())
            .setTtl(m.getTtl())
            .setData(m.getData())
            .build();
    super.onMessageReceived(m2);

    // android lpc
    // AssertionException: Expected to run on UI thread
    // wake up from lpc will run on a diffrent thread, need to switch to the main thread
    var r = (ReactApplication) getApplication();
    runOnUiThread(() -> LpcUtils.createReactContextInBackground(r));
  }

  // when app wake from push notification, rn modules might not available yet
  // need to store those notifications and emit to the main rn later
  private static ArrayList<String> initialNotifications = null;

  public static void getInitialNotifications(Promise p) {
    if (initialNotifications == null) {
      p.resolve(null);
      return;
    }
    try {
      var arr = new String[initialNotifications.size()];
      arr = initialNotifications.toArray(arr);
      initialNotifications = null;
      p.resolve(new JSONArray(arr).toString());
    } catch (Exception e) {
      p.resolve(null);
      Emitter.error("getInitialNotifications", e.getMessage());
    }
  }

  private static WritableMap parse(RemoteMessage m) {
    var p = Arguments.createMap();
    p.putString("from", m.getFrom());
    p.putString("google.message_id", m.getMessageId());
    p.putString("google.to", m.getTo());
    p.putDouble("google.sent_time", m.getSentTime());
    var d = m.getData();
    if (d == null) {
      return p;
    }
    for (var k : d.keySet()) {
      p.putString(k, d.get(k));
    }
    return p;
  }

  // when app wake from push notification, rn modules might not available yet
  // need to store those notifications and emit to the main rn later
  private static ArrayList<String> initialNotifications = null;

  public static void getInitialNotifications(Promise p) {
    if (initialNotifications == null) {
      p.resolve(null);
      return;
    }
    try {
      var arr = new String[initialNotifications.size()];
      arr = initialNotifications.toArray(arr);
      initialNotifications = null;
      p.resolve(new JSONArray(arr).toString());
    } catch (Exception e) {
      p.resolve(null);
      Emitter.error("getInitialNotifications", e.getMessage());
    }
  }

  private static WritableMap parse(RemoteMessage m) {
    var p = Arguments.createMap();
    p.putString("from", m.getFrom());
    p.putString("google.message_id", m.getMessageId());
    p.putString("google.to", m.getTo());
    p.putDouble("google.sent_time", m.getSentTime());
    var d = m.getData();
    if (d == null) {
      return p;
    }
    for (var k : d.keySet()) {
      p.putString(k, d.get(k));
    }
    return p;
  }
}
