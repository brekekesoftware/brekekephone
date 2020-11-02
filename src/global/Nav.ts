import { Nav } from './Nav2'

// Fix ciruclar dependencies
let nav: Nav
export const setNav = (n: Nav) => {
  nav = n
}
export default () => nav
