package com.brekeke.phonedev;

import android.app.Application;
import cl.json.RNSharePackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.brentvatne.react.ReactVideoPackage;
import com.dylanvann.fastimage.FastImageViewPackage;
import com.evollu.react.fcm.FIRMessagingPackage;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.horcrux.svg.SvgPackage;
import com.masteratul.exceptionhandler.ReactNativeExceptionHandlerPackage;
import com.oney.WebRTCModule.WebRTCModulePackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.rnfs.RNFSPackage;
import com.toyberman.drawOverlay.RNDrawOverlayPackage;
import com.zxcpoiu.incallmanager.InCallManagerPackage;
import io.github.elyx0.reactnativedocumentpicker.DocumentPickerPackage;
import io.wazo.callkeep.RNCallKeepPackage;
import java.util.Arrays;
import java.util.List;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import org.reactnative.camera.RNCameraPackage;

public class MainApplication extends Application implements ReactApplication {
  private final ReactNativeHost mReactNativeHost =
      new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          return Arrays.<ReactPackage>asList(
              new IncomingCallReactPackage(),
              new AsyncStoragePackage(),
              new DocumentPickerPackage(),
              new FIRMessagingPackage(),
              new InCallManagerPackage(),
              new LinearGradientPackage(),
              new MainReactPackage(),
              new FastImageViewPackage(),
              new ReactNativeExceptionHandlerPackage(),
              new ReactVideoPackage(),
              new RNCallKeepPackage(),
              new RNCameraPackage(),
              new RNDrawOverlayPackage(),
              new RNFSPackage(),
              new RNSharePackage(),
              new SplashScreenReactPackage(),
              new SvgPackage(),
              new WebRTCModulePackage());
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
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
