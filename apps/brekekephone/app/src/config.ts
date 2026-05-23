import type { WebViewSource } from 'react-native-webview/lib/WebViewTypes'

import json from '../package.json'

export const currentVersion = json.appVersion
export const jssipVersion = json.dependencies.jssip

export const successConnectCheckPeriod = 600000 // 10 minutes
export const fcmApplicationId = '22177122297'
export const bundleIdentifier = 'com.brekeke.phonedev'

export const buildWebViewSource = (uri: string): WebViewSource => ({
  uri,
  headers: {
    'X-Requested-With': bundleIdentifier,
  },
})

// timeout
export const defaultTimeout = 500
export const retryInterval = defaultTimeout
