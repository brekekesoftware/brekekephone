import { WebViewSource } from 'react-native-webview/lib/WebViewTypes'

export const fcmApplicationId = '22177122297'
export const bundleIdentifier = 'com.brekeke.exphonedev'

export const buildWebViewSource = (uri: string): WebViewSource => ({
  uri,
  headers: {
    'X-Requested-With': bundleIdentifier,
  },
})
