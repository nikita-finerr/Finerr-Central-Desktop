package com.finerrcentral

import android.content.Context
import android.media.AudioDeviceInfo
import android.media.AudioManager
import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class FinerrCallBridgeModule(
  reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = NAME

  private val audioManager: AudioManager
    get() =
      reactApplicationContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager

  private fun readSpeakerEnabled(): Boolean {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      val device = audioManager.communicationDevice
      if (device != null) {
        return device.type == AudioDeviceInfo.TYPE_BUILTIN_SPEAKER
      }
    }

    return audioManager.isSpeakerphoneOn
  }

  private fun applySpeakerRoute(enabled: Boolean) {
    if (audioManager.mode != AudioManager.MODE_IN_COMMUNICATION) {
      audioManager.mode = AudioManager.MODE_IN_COMMUNICATION
    }

    audioManager.isSpeakerphoneOn = enabled

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      val devices = audioManager.availableCommunicationDevices
      if (enabled) {
        val speaker =
          devices.find { it.type == AudioDeviceInfo.TYPE_BUILTIN_SPEAKER }
        if (speaker != null) {
          audioManager.setCommunicationDevice(speaker)
        }
      } else {
        val earpiece =
          devices.find { it.type == AudioDeviceInfo.TYPE_BUILTIN_EARPIECE }
        if (earpiece != null) {
          audioManager.setCommunicationDevice(earpiece)
        } else {
          audioManager.clearCommunicationDevice()
        }
      }
    }
  }

  @ReactMethod
  fun dismissIncomingCallAlert(promise: Promise) {
    try {
      IncomingCallRingtonePlayer.stop()
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("DISMISS_INCOMING_CALL_ALERT_ERROR", error.message, error)
    }
  }

  @ReactMethod
  fun configureCallAudio(promise: Promise) {
    try {
      val wasSpeakerOn = readSpeakerEnabled()
      audioManager.mode = AudioManager.MODE_IN_COMMUNICATION
      applySpeakerRoute(wasSpeakerOn)
      promise.resolve(readSpeakerEnabled())
    } catch (error: Exception) {
      promise.reject("CONFIGURE_CALL_AUDIO_ERROR", error.message, error)
    }
  }

  @ReactMethod
  fun releaseCallAudio(promise: Promise) {
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        audioManager.clearCommunicationDevice()
      }
      audioManager.isSpeakerphoneOn = false
      audioManager.mode = AudioManager.MODE_NORMAL
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("RELEASE_CALL_AUDIO_ERROR", error.message, error)
    }
  }

  @ReactMethod
  fun setSpeakerEnabled(enabled: Boolean, promise: Promise) {
    try {
      applySpeakerRoute(enabled)
      promise.resolve(readSpeakerEnabled())
    } catch (error: Exception) {
      promise.reject("SET_SPEAKER_ENABLED_ERROR", error.message, error)
    }
  }

  @ReactMethod
  fun isSpeakerEnabled(promise: Promise) {
    try {
      promise.resolve(readSpeakerEnabled())
    } catch (error: Exception) {
      promise.reject("GET_SPEAKER_ENABLED_ERROR", error.message, error)
    }
  }

  companion object {
    const val NAME = "FinerrCallBridge"
  }
}
