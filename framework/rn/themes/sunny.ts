import common from '@/rn/themes/common.extract-variables.css'
import commonDark from '@/rn/themes/common-dark.extract-variables.css'
import override from '@/rn/themes/sunny.extract-variables.css'
import overrideDark from '@/rn/themes/sunny-dark.extract-variables.css'

import type { ThemeConfig } from '@/rn/core/theme/config'
import { tw } from '@/rn/core/tw/tw'

export const sunnyTheme: ThemeConfig = {
  name: 'sunny',
  // use tw`` here to collect and map when class names are minified
  className: tw`theme-sunny`,
  variables: {
    ...common,
    ...override,
  },
  darkVariables: {
    ...commonDark,
    ...overrideDark,
  },
}
