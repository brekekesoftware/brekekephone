package com.brekeke.phone;

import android.app.Application;
import java.util.Arrays;
import java.util.List;
import com.corbt.keepawake.KCKeepAwakePackage;
import com.evollu.react.fcm.FIRMessagingPackage;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.google.firebase.FirebaseApp;
import com.microsoft.codepush.react.CodePush;
import com.oney.WebRTCModule.WebRTCModulePackage;
import com.zxcpoiu.incallmanager.InCallManagerPackage;
import io.github.elyx0.reactnativedocumentpicker.DocumentPickerPackage;

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
        new CodePush(BuildConfig.CODEPUSH_KEY, getApplicationContext(), BuildConfig.DEBUG),
        new FIRMessagingPackage(),
        new InCallManagerPackage(),
        new KCKeepAwakePackage(),
        new MainReactPackage(),
        new DocumentPickerPackage(),
        new WebRTCModulePackage()
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
