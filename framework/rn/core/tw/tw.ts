import type { ClassNameSingle } from '@/rn/core/tw/class-name'

type FnTaggedTemplateLiteral = (
  strings: TemplateStringsArray,
  ...values: (string | number)[]
) => ClassNameSingle

// only for typing
// this should never get called as it is transpiled and striped out by the babel plugin
export const tw = undefined as any as FnTaggedTemplateLiteral
