import Foundation
import UserNotifications

enum CallConnectivityReminder {
  static let notificationId = "finerr.call.connectivity.reminder"
  static let title = "Open Finerr Central for calls"
  static let body =
    "Incoming calls won't connect while the app is closed. Open the app and stay signed in to receive calls."

  static func schedule() {
    let center = UNUserNotificationCenter.current()
    center.removePendingNotificationRequests(withIdentifiers: [notificationId])
    center.removeDeliveredNotifications(withIdentifiers: [notificationId])

    let content = UNMutableNotificationContent()
    content.title = title
    content.body = body
    content.sound = .default

    let request = UNNotificationRequest(
      identifier: notificationId,
      content: content,
      trigger: UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
    )

    center.add(request)
  }

  static func dismiss() {
    let center = UNUserNotificationCenter.current()
    center.removePendingNotificationRequests(withIdentifiers: [notificationId])
    center.removeDeliveredNotifications(withIdentifiers: [notificationId])
  }
}
