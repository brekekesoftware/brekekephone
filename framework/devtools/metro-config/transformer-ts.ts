import { transform as defaultTransform } from '@react-native/metro-babel-transformer'
import { transform as svgTransform } from 'react-native-svg-transformer/react-native'

import {
  cssExtractVariablesRegex,
  transformCssExtractVariables,
} from '@/devtools/webpack-css-extract-variables/transform'

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

  if (cssExtractVariablesRegex.test(filename)) {
    return defaultTransform({
      filename,
      src: transformCssExtractVariables(src, filename),
      ...options,
    })
  }

  return defaultTransform({
    filename,
    src,
    ...options,
  })
}
