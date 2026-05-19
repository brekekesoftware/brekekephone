import common from '@/rn/themes/common.extract-variables.css'
import commonDark from '@/rn/themes/common-dark.extract-variables.css'
import override from '@/rn/themes/mystic.extract-variables.css'
import overrideDark from '@/rn/themes/mystic-dark.extract-variables.css'

import type { ThemeConfig } from '@/rn/core/theme/config'
import { tw } from '@/rn/core/tw/tw'

export const mysticTheme: ThemeConfig = {
  name: 'mystic',
  // use tw`` here to collect and map when class names are minified
  className: tw`theme-mystic`,
  variables: {
    ...common,
    ...override,
  },
  darkVariables: {
    ...commonDark,
    ...overrideDark,
  },
}
