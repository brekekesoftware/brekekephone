import common from '@/rn/themes/common.extract-variables.scss'
import commonDark from '@/rn/themes/common-dark.extract-variables.scss'
import override from '@/rn/themes/stone.extract-variables.scss'
import overrideDark from '@/rn/themes/stone-dark.extract-variables.scss'

import type { ThemeConfig } from '@/rn/core/theme/config'
import { tw } from '@/rn/core/tw/tw'

export const stoneTheme: ThemeConfig = {
  name: 'stone',
  // use tw`` here to collect and map when class names are minified
  className: tw`theme-stone`,
  variables: {
    ...common,
    ...override,
  },
  darkVariables: {
    ...commonDark,
    ...overrideDark,
  },
}
