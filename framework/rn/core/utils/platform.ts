import { Platform } from 'react-native'

export const platform = Platform.OS

export const isWeb = platform === 'web'
export const isAndroid = platform === 'android'
export const isIos = platform === 'ios'

export const isServer = typeof window === 'undefined'
