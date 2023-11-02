import type { WebViewSource } from 'react-native-webview/lib/WebViewTypes'

export const successConnectCheckPeriod = 600000 // 10 minutes
export const fcmApplicationId = '22177122297'
export const bundleIdentifier = 'com.brekeke.phone'

export const buildWebViewSource = (uri: string): WebViewSource => ({
  uri,
  headers: {
    'X-Requested-With': bundleIdentifier,
  },
})
