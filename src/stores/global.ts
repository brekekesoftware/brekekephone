import { observable } from 'mobx'

import { isWeb } from '#/config'
import { isEmbed } from '#/embed/polyfill'
import { ctx } from '#/stores/ctx'

export class GlobalStore {
  @observable accessor productName = isWeb ? 'Web Phone' : 'Brekeke Phone'
  @observable accessor embedStaticPath = ''

  buildEmbedStaticPath = (path: string) => {
    if (!isEmbed || !this.embedStaticPath) {
      return path
    }
    const isAbsolute = path.startsWith('http') || path.startsWith('/')
    if (isAbsolute) {
      return path
    }
    return (
      this.embedStaticPath.replace(/\/+$/, '') +
      '/' +
      path.replace(/^\.+/, '').replace(/^\/+/, '')
    )
  }
}
ctx.global = new GlobalStore()
