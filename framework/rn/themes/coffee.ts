import override from '@/rn/themes/coffee.extract-variables.scss'
import overrideDark from '@/rn/themes/coffee-dark.extract-variables.scss'
import common from '@/rn/themes/common.extract-variables.scss'
import commonDark from '@/rn/themes/common-dark.extract-variables.scss'

import type { ThemeConfig } from '@/rn/core/theme/config'
import { tw } from '@/rn/core/tw/tw'

export const coffeeTheme: ThemeConfig = {
  name: 'coffee',
  // use tw`` here to collect and map when class names are minified
  className: tw`theme-coffee`,
  variables: {
    ...common,
    ...override,
  },
  darkVariables: {
    ...commonDark,
    ...overrideDark,
  },
}
