import common from '@/rn/themes/common.extract-variables.scss'
import commonDark from '@/rn/themes/common-dark.extract-variables.scss'
import override from '@/rn/themes/ocean.extract-variables.scss'
import overrideDark from '@/rn/themes/ocean-dark.extract-variables.scss'

import type { ThemeConfig } from '@/rn/core/theme/config'
import { tw } from '@/rn/core/tw/tw'

export const oceanTheme: ThemeConfig = {
  name: 'ocean',
  // use tw`` here to collect and map when class names are minified
  className: tw`theme-ocean`,
  variables: {
    ...common,
    ...override,
  },
  darkVariables: {
    ...commonDark,
    ...overrideDark,
  },
}
