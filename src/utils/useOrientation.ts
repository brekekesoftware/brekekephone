import { useEffect, useState } from 'react'
import { Dimensions } from 'react-native'

export enum EOrientation {
  Portrait = 'Portrait',
  Landscape = 'Landscape',
}

export const useOrientation = () => {
  const [orientation, setOrientation] = useState<EOrientation>(
    EOrientation.Portrait,
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
