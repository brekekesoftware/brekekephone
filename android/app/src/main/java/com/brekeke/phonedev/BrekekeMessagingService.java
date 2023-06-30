package com.brekeke.phonedev;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.common.LifecycleState;
import com.google.firebase.messaging.RemoteMessage;
import com.wix.reactnativenotifications.fcm.FcmInstanceIdListenerService;
import java.util.ArrayList;
import org.json.JSONArray;

public class BrekekeMessagingService extends FcmInstanceIdListenerService {
  private static String TAG = "BrekekeMessagingService";
  private static boolean alreadyGetInitialNotifications = false;
  private static ArrayList<String> initialNotifications = null;

  public static void getInitialNotifications(Promise promise) {
    if (initialNotifications == null) {
      promise.resolve(null);
      return;
    }
    try {
      String[] arr = new String[initialNotifications.size()];
      arr = initialNotifications.toArray(arr);
      initialNotifications = null;
      promise.resolve(new JSONArray(arr).toString());
    } catch (Exception e) {
      promise.resolve(null);
      Log.e(TAG, "getInitialNotifications exception: " + e);
    }
  }

  @Override
  public void onMessageReceived(RemoteMessage remoteMessage) {

    UiThreadUtil.runOnUiThread(
     new Runnable() {
       @Override
       public void run() {
         try {
           // Construct and load our normal React JS code bundle
           ReactInstanceManager mReactInstanceManager = ((ReactApplication) getApplication()).getReactNativeHost().getReactInstanceManager();
           mReactInstanceManager.addReactInstanceEventListener(new ReactInstanceManager.ReactInstanceEventListener() {
             public void onReactContextInitialized(ReactContext context) {
               Log.e(TAG, "dev::onMessageReceived:onReactContextInitialized ");
               BrekekeUtils.onFcmMessageReceived(getApplication(), remoteMessage.getData());
               mReactInstanceManager.builder().setInitialLifecycleState(LifecycleState.RESUMED);
             }
           });
           if (!mReactInstanceManager.hasStartedCreatingInitialContext()) {
             // Construct it in the background
             Log.e(TAG, "dev::onMessageReceived:createReactContextInBackground ");
             mReactInstanceManager.createReactContextInBackground();
           }
         } catch (Exception e) {
           Log.e(TAG, "dev::runOnUiThread:: "+ e.getMessage() );
         }
       }
     });

//    Handler handler = new Handler(Looper.getMainLooper());
//    handler.post(new Runnable() {
//      public void run() {
//        // Construct and load our normal React JS code bundle
//        ReactInstanceManager rim =
//         ((ReactApplication) getApplication()).getReactNativeHost().getReactInstanceManager();
//        if (!rim.hasStartedCreatingInitialContext()) {
//          Log.e(TAG, "dev::onMessageReceived:createReactContextInBackground ");
//          rim.createReactContextInBackground();
//        }else{
//          rim.recreateReactContextInBackground();
//        }
//      }
//    });

//   try {
//      // construct and load our normal React JS code bundle
//      ReactInstanceManager rim =
//       ((ReactApplication) getApplication()).getReactNativeHost().getReactInstanceManager();
//      if (!rim.hasStartedCreatingInitialContext()) {
//        Log.e(TAG, "dev::onMessageReceived:createReactContextInBackground ");
//        rim.createReactContextInBackground();
//      }
//    }catch(Exception ex){
//      Log.e(TAG, "dev::onMessageReceived: "+ ex.getMessage());
//    }

    Log.e(TAG, "dev::onMessageReceived: ");
    BrekekeUtils.onFcmMessageReceived(getApplication(), remoteMessage.getData());

    if (initialNotifications == null) {
      initialNotifications = new ArrayList<String>();
    }
    try {
      initialNotifications.add(
          ReactNativeJson.convertMapToJson(BrekekeUtils.parseParams(remoteMessage)).toString());
    } catch (Exception e) {
      Log.e(TAG, "initialNotifications.add exception: " + e);
    }

    super.onMessageReceived(remoteMessage);
  }
}
