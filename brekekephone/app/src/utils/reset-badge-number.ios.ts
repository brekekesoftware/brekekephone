// separate this file to fix circular dependency
import PushNotificationIOS from '@react-native-community/push-notification-ios'

export const resetBadgeNumber = () => {
  PushNotificationIOS.setApplicationIconBadgeNumber(0)
}
