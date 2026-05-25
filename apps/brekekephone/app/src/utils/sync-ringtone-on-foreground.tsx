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
  onForeGroundRef.current = onForeGround

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      const appState = appStateRef.current
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        const r = await handleRingtoneOptionsInSetting()
        if (r) {
          onForeGroundRef.current(r)
        }
      }
      appStateRef.current = nextAppState
    }

    const listener = AppState.addEventListener('change', handleAppStateChange)
    return () => {
      listener.remove()
    }
  }, [])

  return null
}
