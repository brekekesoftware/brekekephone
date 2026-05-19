import type { ImageStyle } from 'react-native'

export type ImagePropsWocn = {
  // only support some basic props
  // resize mode should be supported using class name in native
  // other nextjs features such as image optimization or ratio
  // should be done in api backend
  src: string
  style?: ImageStyle
}

export const ImageWocn = (props: ImagePropsWocn) => <img {...(props as any)} />
