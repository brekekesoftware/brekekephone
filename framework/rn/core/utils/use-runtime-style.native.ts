import { useThemeVariables } from '@/rn/core/theme/use-theme-variables'
import type { ClassName } from '@/rn/core/tw/class-name'
import { runtimeStyle } from '@/rn/core/tw/runtime-style'
import { useClassNameState } from '@/rn/core/utils/use-class-name-state.native'

export const useRuntimeStyle = async (className: ClassName) => {
  const state = await useClassNameState()
  const variables = await useThemeVariables()
  return runtimeStyle(className, {
    state,
    variables,
  })
}
