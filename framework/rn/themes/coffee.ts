import override from '@/rn/themes/coffee.extract-variables.css'
import overrideDark from '@/rn/themes/coffee-dark.extract-variables.css'
import common from '@/rn/themes/common.extract-variables.css'
import commonDark from '@/rn/themes/common-dark.extract-variables.css'

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
