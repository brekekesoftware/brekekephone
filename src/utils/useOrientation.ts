import { useEffect, useState } from 'react'
import { Dimensions, Platform } from 'react-native'

/* This hook will use later. Current not handle orientation */

export enum EOrientation {
  Portrait = 'Portrait',
  Landscape = 'Landscape',
}

export const useOrientation = () => {
  const w = Dimensions.get('window')
  const [orientation, setOrientation] = useState<EOrientation>(
    w.width < w.height || Platform.OS === 'web'
      ? EOrientation.Portrait
      : EOrientation.Landscape,
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
