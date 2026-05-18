import type { Node, NodePath, types as t } from '@babel/core'
import type { Platform } from 'react-native'

import { readTwExtractOutput } from '@/devtools/babel-plugin-tw/lib/config'
import type { Twrnc } from '@/devtools/babel-plugin-tw/lib/create-twrnc'
import { createTwrnc } from '@/devtools/babel-plugin-tw/lib/create-twrnc'
import type { WithPath } from '@/devtools/babel-plugin-tw/lib/path-to-js'
import { transpileClassName } from '@/devtools/babel-plugin-tw/lib/transpile-class-name'
import type { TwPluginOptions } from '@/devtools/babel-plugin-tw/visitor'
import type { ClassName } from '@/rn/core/tw/class-name'
import type { StrMap } from '@/shared/ts-utils'

export type Ctx = {
  programPath: NodePath<t.Program>
  rootPath: NodePath
  isInFunction: boolean
  platform: Platform['OS']
  // omit in jsx class name or tagged template literal
  calleeName?: string
  twrnc: Twrnc
  min?: StrMap<string>
  extract?: (classNames: string[]) => void
  err: (path: NodePath<any>, msg: string) => Error
  // closure
  transpileClassName: (v: WithPath<string>) => ClassName | Node
}

export type ContextOptions = Pick<
  TwPluginOptions,
  'extractOutputPath' | 'twrncConfig'
> &
  Pick<Ctx, 'programPath' | 'rootPath' | 'platform' | 'calleeName'> &
  Partial<Pick<Ctx, 'extract' | 'err'>>

const codeFrameErr = (path: NodePath, msg: string) =>
  path.buildCodeFrameError(msg)

export const context = ({
  extractOutputPath,
  twrncConfig,
  programPath,
  rootPath,
  platform,
  calleeName,
  extract,
  err = codeFrameErr,
}: ContextOptions) => {
  const twrnc = createTwrnc(platform, twrncConfig)

  const ctx: Ctx = {
    programPath,
    rootPath,
    isInFunction: !!rootPath.getFunctionParent(),
    platform,
    calleeName,
    twrnc,
    min: readTwExtractOutput(extractOutputPath),
    extract,
    err,
    transpileClassName: v => {
      const className = v.value
      if (typeof className !== 'string') {
        throw err(v.path, 'expect string literal')
      }
      return transpileClassName({
        className,
        ctx,
        path: v.path,
      })
    },
  }

  if (extract && platform !== 'web' && !process.env._MOCK_PLATFORM_OS) {
    throw err(programPath, `BUG: extract in ${platform}`)
  }

  return ctx
}
