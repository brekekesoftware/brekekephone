import { Platform } from 'react-native'
import type { WebViewSource } from 'react-native-webview/lib/WebViewTypes'

export const successConnectCheckPeriod = 600000 // 10 minutes
export const fcmApplicationId = '22177122297'
export const bundleIdentifier = 'com.brekeke.phonedev'

export const buildWebViewSource = (uri: string): WebViewSource => ({
  uri,
  headers: {
    'X-Requested-With': bundleIdentifier,
  },
})

export const isAndroid = Platform.OS === 'android'
export const isIos = Platform.OS === 'ios'
export const isWeb = Platform.OS === 'web'
export const isEmbed = isWeb && !window._BrekekePhoneWebRoot
