import { useEffect, useRef } from 'react'
import type { AppStateStatus } from 'react-native'
import { AppState } from 'react-native'

import type { RingtoneOption } from '#/utils/get-ringtone-options'
import { handleRingtoneOptionsInSetting } from '#/utils/get-ringtone-options'

type Props = {
  onForeGround: ({ ro, r }: { ro: RingtoneOption[]; r: string }) => void
}

export const SyncRingtoneOnForeground = ({ onForeGround }: Props) => {
  const appStateRef = useRef<AppStateStatus>(AppState.currentState)
  const onForeGroundRef = useRef(onForeGround)
  const mountedRef = useRef(true)
  onForeGroundRef.current = onForeGround

  useEffect(() => {
    mountedRef.current = true
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      const appState = appStateRef.current
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        const r = await handleRingtoneOptionsInSetting()
        if (r && mountedRef.current) {
          onForeGroundRef.current(r)
        }
      }
      appStateRef.current = nextAppState
    }

    const listener = AppState.addEventListener('change', handleAppStateChange)
    return () => {
      mountedRef.current = false
      listener.remove()
    }
  }, [])

  return null
}
