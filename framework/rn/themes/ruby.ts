import common from '@/rn/themes/common.extract-variables.scss'
import commonDark from '@/rn/themes/common-dark.extract-variables.scss'
import override from '@/rn/themes/ruby.extract-variables.scss'
import overrideDark from '@/rn/themes/ruby-dark.extract-variables.scss'

import type { ThemeConfig } from '@/rn/core/theme/config'
import { tw } from '@/rn/core/tw/tw'

export const rubyTheme: ThemeConfig = {
  name: 'ruby',
  // use tw`` here to collect and map when class names are minified
  className: tw`theme-ruby`,
  variables: {
    ...common,
    ...override,
  },
  darkVariables: {
    ...commonDark,
    ...overrideDark,
  },
}
