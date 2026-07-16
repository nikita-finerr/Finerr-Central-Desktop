package com.finerrcentral

import android.app.Service
import android.content.Intent
import android.os.IBinder

class CallConnectivityService : Service() {
  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    return START_NOT_STICKY
  }

  override fun onTaskRemoved(rootIntent: Intent?) {
    CallConnectivityReminder.show(applicationContext)
    stopSelf()
    super.onTaskRemoved(rootIntent)
  }
}
