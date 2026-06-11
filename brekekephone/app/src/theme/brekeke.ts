import type { ThemeConfig } from '@rntwsc/rn/core/theme/config'

import { darkVariables, variables } from '#/theme/brekeke-scss'

export const brekekeTheme: ThemeConfig = {
  name: 'brekeke',
  variables,
  darkVariables,
  // We dont need class name since the variables apply directly to the html root
  // We dont change theme so it is ok to apply directly to the html root
  className: '',
}
