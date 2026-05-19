import { useDarkModeState } from '@/rn/core/dark-mode/use-dark-mode-state'
import { useResponsiveState } from '@/rn/core/responsive/use-responsive-state'
import {
  useMarkerGroupState,
  useMarkerPeerState,
} from '@/rn/core/tw/lib/marker.native'

export const useClassNameState = async () => {
  const responsiveState = useResponsiveState()
  const darkModeState = await useDarkModeState()
  const groupState = useMarkerGroupState()
  const peerState = useMarkerPeerState()
  return {
    ...responsiveState,
    ...darkModeState,
    ...groupState,
    ...peerState,
  }
}
