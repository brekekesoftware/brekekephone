import type { Nav2 } from '#/stores/Nav2'

// fix ciruclar dependencies
let nav: Nav2
export const setNav = (n: Nav2) => {
  nav = n
}
export const Nav = () => nav
