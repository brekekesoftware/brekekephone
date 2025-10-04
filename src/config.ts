import { Platform } from 'react-native'
import type { WebViewSource } from 'react-native-webview/lib/WebViewTypes'

import json from '../package.json'

export const currentVersion = json.version
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

export const isAndroid = Platform.OS === 'android'
export const isIos = Platform.OS === 'ios'
export const isWeb = Platform.OS === 'web'

// timeout
export const defaultTimeout = 300 // 0.3 seconds
export const retryInterval = 300 // 0.3 seconds
export const holdingTimeout = 500 // 0.5 seconds
