import { isWeb } from '@rntwsc/rn/core/utils/platform'

import Svg, * as svg from '#/icons/settings.svg'

import { createSvgIcon } from '#/utils/rn-core-hooks'

// craco does not export as default
const Component = isWeb ? svg.ReactComponent : Svg
export const IconSettings = createSvgIcon(Component)
