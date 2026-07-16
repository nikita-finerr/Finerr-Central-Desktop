package com.finerrcentral

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.os.Build
import androidx.core.app.NotificationCompat

object CallConnectivityReminder {
  private const val CHANNEL_ID = "finerr_call_connectivity"
  private const val NOTIFICATION_ID = 92001
  private const val BRAND_PRIMARY = "#4F46E5"

  const val TITLE = "Open Finerr Central for calls"
  const val BODY =
    "Incoming calls won't connect while the app is closed. Open the app and stay signed in to receive calls."

  fun show(context: Context) {
    val notificationManager =
      context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channel =
        NotificationChannel(
          CHANNEL_ID,
          "Call availability",
          NotificationManager.IMPORTANCE_HIGH,
        ).apply {
          description = "Reminders to keep the app open for incoming calls"
          enableLights(true)
          lightColor = Color.parseColor(BRAND_PRIMARY)
        }
      notificationManager.createNotificationChannel(channel)
    }

    val launchIntent =
      Intent(context, MainActivity::class.java).apply {
        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
      }
    val pendingIntent =
      PendingIntent.getActivity(
        context,
        0,
        launchIntent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
      )

    val smallIconId =
      context.resources.getIdentifier("notification_icon", "drawable", context.packageName).let { id ->
        if (id != 0) id else R.drawable.ic_notification_call_accept
      }

    val notification =
      NotificationCompat.Builder(context, CHANNEL_ID)
        .setSmallIcon(smallIconId)
        .setContentTitle(TITLE)
        .setContentText(BODY)
        .setStyle(NotificationCompat.BigTextStyle().bigText(BODY))
        .setPriority(NotificationCompat.PRIORITY_HIGH)
        .setAutoCancel(true)
        .setContentIntent(pendingIntent)
        .build()

    notificationManager.notify(NOTIFICATION_ID, notification)
  }

  fun dismiss(context: Context) {
    val notificationManager =
      context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    notificationManager.cancel(NOTIFICATION_ID)
  }
}
