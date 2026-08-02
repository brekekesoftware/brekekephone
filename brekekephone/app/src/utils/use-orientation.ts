import { useEffect, useState } from 'react'
import { Dimensions } from 'react-native'

// used by the call manage page to switch its layout on device rotation.
// web runs on mobile only, so a wider-than-tall window is a real rotation too.
export enum EOrientation {
  Portrait = 'Portrait',
  Landscape = 'Landscape',
}

export const useOrientation = () => {
  const w = Dimensions.get('window')
  const [orientation, setOrientation] = useState<EOrientation>(
    w.width < w.height ? EOrientation.Portrait : EOrientation.Landscape,
  )

  useEffect(() => {
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
