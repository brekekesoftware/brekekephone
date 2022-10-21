import EventEmitter from 'eventemitter3'

import { MakeCallFn } from '../api/brekekejs'
import { getCallStore } from '../stores/cancelRecentPn'
import { promptBrowserPermission } from '../utils/promptBrowserPermission'

export class EmbedApi extends EventEmitter {
  palParams?: { [k: string]: string }

  getRunningCalls = () => getCallStore().calls
  call: MakeCallFn = (...args) => getCallStore().startCall(...args)
  promptBrowserPermission = promptBrowserPermission
}

export const embedApi = new EmbedApi()
