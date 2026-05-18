import type { LoaderContext } from 'webpack'

import {
  cssVariablesFilenameRegex,
  transformCssVariables,
} from '@/devtools/webpack-css-variables/transform-css-variables'

// eslint-disable-next-line import/no-default-export
export default function cssVariables(this: LoaderContext<object>, src: string) {
  if (!cssVariablesFilenameRegex.test(this.resourcePath)) {
    throw new Error('Expected file name to match css variable regex pattern')
  }
  return transformCssVariables(src)
}
