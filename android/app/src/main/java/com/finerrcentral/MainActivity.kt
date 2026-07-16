package com.finerrcentral

import android.content.Intent
import android.os.Build
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.zoontek.rnbootsplash.RNBootSplash
import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    CallConnectivityReminder.dismiss(this)
    startService(Intent(this, CallConnectivityService::class.java))
    RNBootSplash.init(this, R.style.BootTheme)
    // @generated begin bootsplash-init - expo prebuild (DO NOT MODIFY) sync-f0f7dbc46f1d82498f47676b4197e1949dc7790f
    RNBootSplash.init(this, R.style.BootTheme)
    // @generated end bootsplash-init
    super.onCreate(savedInstanceState)
  }

  override fun getMainComponentName(): String = "main"

  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
      this,
      BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
      object : DefaultReactActivityDelegate(
        this,
        mainComponentName,
        fabricEnabled,
      ) {},
    )
  }

  override fun invokeDefaultOnBackPressed() {
    if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
      if (!moveTaskToBack(false)) {
        super.invokeDefaultOnBackPressed()
      }
      return
    }

    super.invokeDefaultOnBackPressed()
  }
}
