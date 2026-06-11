import Svg, * as svg from '#/icons/pencil.svg'

import { isWeb } from '@/rn/core/utils/platform'
import { createSvgIcon } from '#/utils/rn-core-hooks'

// craco does not export as default
const Component = isWeb ? svg.ReactComponent : Svg
export const IconPencil = createSvgIcon(Component)
