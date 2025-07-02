import { observable } from 'mobx'

import { isWeb } from '#/config'
import { ctx } from '#/stores/ctx'

export class GlobalStore {
  @observable productName = isWeb ? 'Web Phone' : 'Brekeke Phone'
}
ctx.global = new GlobalStore()
