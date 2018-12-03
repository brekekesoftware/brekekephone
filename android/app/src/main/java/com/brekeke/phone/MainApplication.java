package com.brekeke.phone;

import android.app.Application;

import com.oney.WebRTCModule.WebRTCModulePackage;
import com.corbt.keepawake.KCKeepAwakePackage;
import com.zxcpoiu.incallmanager.InCallManagerPackage;
import com.evollu.react.fcm.FIRMessagingPackage;
import com.google.firebase.FirebaseApp;
import com.microsoft.codepush.react.CodePush;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

        @Override
        protected String getJSBundleFile() {
        return CodePush.getJSBundleFile();
        }
    
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
			new MainReactPackage(),
            new WebRTCModulePackage(),
            new KCKeepAwakePackage(),
            new InCallManagerPackage(),
            new FIRMessagingPackage(),
            new CodePush(BuildConfig.CODEPUSH_KEY, getApplicationContext(), BuildConfig.DEBUG)
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index.native";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
