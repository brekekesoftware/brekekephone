import { isWeb } from '@rntwsc/rn/core/utils/platform'
import { useEffect, useState } from 'react'
import { Dimensions } from 'react-native'

// used by the call manage page to switch its layout on device rotation.
// web always reports Portrait: the browser window is not a phone rotation
export enum EOrientation {
  Portrait = 'Portrait',
  Landscape = 'Landscape',
}

export const useOrientation = () => {
  const w = Dimensions.get('window')
  const [orientation, setOrientation] = useState<EOrientation>(
    w.width < w.height || isWeb
      ? EOrientation.Portrait
      : EOrientation.Landscape,
  )

  useEffect(() => {
    if (isWeb) {
      return undefined
    }
    const dHandler = Dimensions.addEventListener(
      'change',
      ({ window: { width, height } }) => {
        width < height
          ? setOrientation(EOrientation.Portrait)
          : setOrientation(EOrientation.Landscape)
      },
    )
    return () => dHandler.remove()
  }, [])

  return orientation
}
