import { isWeb } from '@rntwsc/rn/core/utils/platform'
import { makeAutoObservable } from 'mobx'

import { isEmbed } from '#/embed/polyfill'
import { ctx } from '#/stores/ctx'

export class GlobalStore {
  constructor() {
    makeAutoObservable(this)
  }

  productName = isWeb ? 'Web Phone' : 'Brekeke Phone'
  embedStaticPath = ''
  darkModeLoading = true

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
