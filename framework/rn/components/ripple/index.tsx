import type { ReactNode } from 'react'

import type { RippleProps } from '@/rn/components/ripple/ripple'
import { Ripple } from '@/rn/components/ripple/ripple'
import type { PressableProps } from '@/rn/core/components/pressable'

export const useRipple = (
  props: RippleProps,
): [ReactNode, PressableProps | undefined] => [<Ripple {...props} />, undefined]
