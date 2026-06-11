import type { LoaderContext } from 'webpack'

import {
  cssExtractVariablesRegex,
  transformCssExtractVariables,
} from '@/devtools/webpack-css-extract-variables/transform'

// eslint-disable-next-line import/no-default-export
export default function cssExtractVariablesLoader(
  this: LoaderContext<object>,
  src: string,
) {
  if (!cssExtractVariablesRegex.test(this.resourcePath)) {
    throw new Error(
      'Expected file name to match css extract variables regex pattern',
    )
  }
  return transformCssExtractVariables(src, this.resourcePath)
}
