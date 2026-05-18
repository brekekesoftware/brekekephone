import '@/rn/components/inset/inset.css'

import { tw } from '@/rn/core/tw/tw'

// it is difficult to write tailwind class name for complex css
// we will write css and put it here to get transpile reference
// use tw`` here to collect and map when class names are minified
export const insetShadowClassName = tw`inset`
