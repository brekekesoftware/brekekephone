package com.brekeke.phonedev;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

class BrekekeUtilsReactPackage implements ReactPackage {
  @Override
  public List<NativeModule> createNativeModules(ReactApplicationContext ctx) {
    var l = new ArrayList<NativeModule>();
    l.add(new BrekekeUtils(ctx));
    return l;
  }

  @Override
  public List<ViewManager> createViewManagers(ReactApplicationContext ctx) {
    return Collections.emptyList();
  }
}
