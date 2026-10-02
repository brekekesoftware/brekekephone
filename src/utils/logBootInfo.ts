import { Platform } from 'react-native'

import { isWeb } from '#/config'

// one line in the app log that tells which react-native, architecture and
// js engine run; the e2e tests read it (upgrade plan: rn 0.87, new, hermes)
export const logBootInfo = () => {
  if (isWeb) {
    return
  }
  const g = globalThis as {
    HermesInternal?: unknown
    nativeFabricUIManager?: unknown
  }
  const v = Platform.constants.reactNativeVersion
  const arch = g.nativeFabricUIManager ? 'new' : 'old'
  const engine = g.HermesInternal ? 'hermes' : 'jsc'
  // warn, not log: debugStore saves only warn and error until the debug log
  // setting is read from storage, which is after this line runs
  console.warn(
    `BootInfo rn=${v.major}.${v.minor}.${v.patch} arch=${arch} engine=${engine}`,
  )
}
