import type { TwConfig } from 'twrnc'

import type { ThemeConfig } from '@/rn/core/theme/config'
import type { StrMap } from '@/shared/ts-utils'

const colors = [
  'primary',
  'secondary',
  'info',
  'success',
  'warning',
  'error',
] as const
const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const
const semantic = [
  'background',
  'subtle',
  'muted',
  'foreground',
  'foreground-muted',
  'foreground-subtle',
  'foreground-disabled',
  'foreground-inverse',
  'border',
  'border-subtle',
  'border-strong',
  'card',
  'card-border',
  'modal',
  'modal-overlay',
  'surface',
  'surface-raised',
  'ring',
] as const

const twrncThemeColors: StrMap<StrMap<string>> = {}
for (const color of colors) {
  twrncThemeColors[color] = {}
  for (const step of steps) {
    twrncThemeColors[color][step] = `var(--${color}-${step})`
  }
  twrncThemeColors[color].DEFAULT = `var(--${color}-500)`
}
for (const color of semantic) {
  twrncThemeColors[color] = {
    DEFAULT: `var(--${color})`,
  }
}

export type ThemeVariables = {
  [k in `--${(typeof colors)[number]}-${(typeof steps)[number]}`]: string
} & {
  [k in `--${(typeof semantic)[number]}`]: string
}

export const twrncConfig: TwConfig = {
  theme: {
    extend: {
      colors: twrncThemeColors,
    },
  },
}

export const validateThemeVariables = (t: ThemeConfig) => {
  if (process.env.NODE_ENV === 'production') {
    return
  }

  const variables = t.variables as StrMap<string>

  const invalidOrMissing: string[] = []
  const valid: StrMap<boolean> = {}

  for (const color of colors) {
    for (const step of steps) {
      const k = `--${color}-${step}`
      valid[k] = true

      if (typeof variables[k] !== 'string') {
        invalidOrMissing.push(k)
      }
    }
  }

  for (const color of semantic) {
    const k = `--${color}`
    valid[k] = true

    if (typeof variables[k] !== 'string') {
      invalidOrMissing.push(k)
    }
  }

  for (const k of Object.keys(variables)) {
    if (!valid[k]) {
      invalidOrMissing.push(k)
    }
  }

  if (!invalidOrMissing.length) {
    return
  }

  const keys = invalidOrMissing.join(', ')
  console.error(`Theme ${t.name} invalid or missing variables: ${keys}`)
}
