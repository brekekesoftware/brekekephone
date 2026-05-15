import { writeTwExtractOutput } from '@/devtools/babel-plugin-tw/lib/config'
import type { Ctx } from '@/devtools/babel-plugin-tw/lib/context'
import { generateMinifiedClassName } from '@/devtools/babel-plugin-tw/lib/generate-minified-class-name'
import { createVisitor } from '@/devtools/babel-plugin-tw/visitor'
import type { StrMap } from '@/shared/ts-utils'

type Options = Pick<Ctx, 'err'> & {
  twExtractOutputPath: string
}

export const twExtract = ({ err, twExtractOutputPath }: Options) => {
  const minified: StrMap<string> = {}
  let n = 0

  const extract = (classNames: string[]) => {
    for (const c of classNames) {
      minified[c] = generateMinifiedClassName(n)
      n++
    }
  }

  return {
    visitor: createVisitor({ extract, err }),
    done: () => writeTwExtractOutput(twExtractOutputPath, minified),
  }
}
