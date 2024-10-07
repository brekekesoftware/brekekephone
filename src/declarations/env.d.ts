/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-duplicates */

declare module 'jssip' {
  const m: unknown
  export default m
}

declare module 'validatorjs/src/lang/en' {
  const en: { [k: string]: string }
  export default en
}

declare module 'handlebars/dist/handlebars' {
  import m from 'handlebars'

  export default m
}

declare module 'helper-moment' {
  import type h from 'handlebars'

  const m: h.HelperDelegate
  export default m
}

declare module '*.mp3' {
  const src: string
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}
