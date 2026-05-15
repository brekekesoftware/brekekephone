// tsconfig-paths and json5 were installed at the repo root

declare module 'tsconfig-paths/register' {
  const m: never
  export = m
}
declare module 'json5/lib/register' {
  const m: never
  export = m
}

// tsconfig commonjs, some of the type definitions are not
// compatible with our setup, so we declare it here
declare module '*.css' {
  const m: any
  export = m
}
declare module '*.svg' {
  const m: any
  export default m
}
declare module 'bezier-easing' {
  const m: Function
  export = m
}
