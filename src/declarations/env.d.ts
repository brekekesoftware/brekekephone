declare module 'jssip' {
  const m: unknown
  export = m
}

declare module 'validatorjs/src/lang/en' {
  const en: { [k: string]: string }
  export = en
}

declare module 'handlebars/dist/handlebars' {
  import m from 'handlebars'

  export = m
}

declare module 'helper-moment' {
  import type h from 'handlebars'

  const m: h.HelperDelegate
  export = m
}

declare module '*.mp3' {
  const src: string
  export = src
}

declare module '*.png' {
  const src: string
  export = src
}
