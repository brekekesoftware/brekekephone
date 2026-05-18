import { transform as defaultTransform } from '@react-native/metro-babel-transformer'
import { transform as svgTransform } from 'react-native-svg-transformer/react-native'

import {
  cssVariablesFilenameRegex,
  transformCssVariables,
} from '@/devtools/webpack-css-variables/transform-css-variables'

type Options = {
  filename: string
  src: string
}

export const transform = ({ filename, src, ...options }: Options) => {
  if (filename.endsWith('.svg')) {
    return svgTransform({
      filename,
      src,
      ...options,
    })
  }

  if (cssVariablesFilenameRegex.test(filename)) {
    return defaultTransform({
      filename,
      src: transformCssVariables(src),
      ...options,
    })
  }

  return defaultTransform({
    filename,
    src,
    ...options,
  })
}
