package com.finerrcentral

import android.content.Context
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.media.Ringtone
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.util.Log

object IncomingCallRingtonePlayer {
  private const val TAG = "IncomingCallRingtone"

  private var ringtone: Ringtone? = null
  private var mediaPlayer: MediaPlayer? = null

  @Synchronized
  fun start(context: Context) {
    stop()

    val appContext = context.applicationContext
    val uri = getCallRingtoneUri(appContext) ?: return

    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
        ringtone =
          RingtoneManager.getRingtone(appContext, uri)?.apply {
            isLooping = true
            audioAttributes = createRingtoneAudioAttributes()
            play()
          }
        return
      }

      mediaPlayer =
        MediaPlayer().apply {
          setDataSource(appContext, uri)
          setAudioAttributes(createRingtoneAudioAttributes())
          isLooping = true
          prepare()
          start()
        }
    } catch (error: Exception) {
      Log.e(TAG, "Failed to start incoming call ringtone", error)
      stop()
    }
  }

  @Synchronized
  fun stop() {
    try {
      ringtone?.stop()
    } catch (_: Exception) {
    } finally {
      ringtone = null
    }

    try {
      mediaPlayer?.stop()
      mediaPlayer?.release()
    } catch (_: Exception) {
    } finally {
      mediaPlayer = null
    }
  }

  private fun getCallRingtoneUri(context: Context): Uri? {
    return RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
      ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
      ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
  }

  private fun createRingtoneAudioAttributes(): AudioAttributes {
    return AudioAttributes.Builder()
      .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
      .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
      .build()
  }
}
