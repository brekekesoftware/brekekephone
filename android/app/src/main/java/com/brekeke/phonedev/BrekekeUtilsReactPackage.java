package com.brekeke.phonedev;

import com.facebook.react.BaseReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfo;
import com.facebook.react.module.model.ReactModuleInfoProvider;
import java.util.HashMap;

class BrekekeUtilsReactPackage extends BaseReactPackage {
  @Override
  public NativeModule getModule(String name, ReactApplicationContext ctx) {
    if (NativeBrekekeUtilsSpec.NAME.equals(name)) {
      return new BrekekeUtils(ctx);
    }
    return null;
  }

  @Override
  public ReactModuleInfoProvider getReactModuleInfoProvider() {
    return () -> {
      var m = new HashMap<String, ReactModuleInfo>();
      m.put(
          NativeBrekekeUtilsSpec.NAME,
          new ReactModuleInfo(
              NativeBrekekeUtilsSpec.NAME,
              BrekekeUtils.class.getName(),
              false,
              false,
              false,
              true));
      return m;
    };
  }
}