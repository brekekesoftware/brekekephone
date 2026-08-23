package com.brekeke.phonedev

import android.app.Activity
import android.app.Application
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.os.Bundle
import com.brekeke.phonedev.utils.Ctx
import com.brekeke.phonedev.utils.Emitter
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost

class MainApplication : Application(), ReactApplication {
  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply { add(BrekekeUtilsReactPackage()) }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = false
        override val isHermesEnabled: Boolean = false
      }
  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
    Ctx.wakeFromMainRn(this)
    registerAppVisibilityCallbacks()
  }

  // AppState in js only tracks MainActivity, but a fullscreen call is shown by
  // IncomingCallActivity, so AppState is already "background" during a call and
  // pressing home emits no transition. Count started activities instead to know
  // when the app is really not visible. Started/stopped and not resumed/paused:
  // on an A -> B transition B.onStart runs before A.onStop, so the count never
  // dips to 0 and there is no spurious hide on every activity switch
  private fun registerAppVisibilityCallbacks() {
    registerActivityLifecycleCallbacks(
        object : ActivityLifecycleCallbacks {
          private var started = 0

          override fun onActivityStarted(a: Activity) {
            if (++started == 1) {
              Emitter.emit("appVisibility", "1")
            }
          }

          override fun onActivityStopped(a: Activity) {
            if (--started == 0) {
              Emitter.emit("appVisibility", "0")
            }
          }

          override fun onActivityCreated(a: Activity, b: Bundle?) {}

          override fun onActivityResumed(a: Activity) {}

          override fun onActivityPaused(a: Activity) {}

          override fun onActivitySaveInstanceState(a: Activity, b: Bundle) {}

          override fun onActivityDestroyed(a: Activity) {}
        })
  }

  override fun registerReceiver(receiver: BroadcastReceiver?, filter: IntentFilter): Intent? {
    return if (Build.VERSION.SDK_INT >= 34 && applicationInfo.targetSdkVersion >= 34) {
      super.registerReceiver(receiver, filter, Context.RECEIVER_EXPORTED)
    } else {
      super.registerReceiver(receiver, filter)
    }
  }
}
