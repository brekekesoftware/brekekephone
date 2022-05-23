import EventEmitter from 'eventemitter3'

import { getCallStore } from '../stores/cancelRecentPn'
import { promptBrowserPermission } from '../utils/promptBrowserPermission'

export class AsComponent extends EventEmitter {
  getRunningCalls = () => getCallStore().calls
  call = (number: string, o?: object) => getCallStore().startCall(number, o)
  promptBrowserPermission = promptBrowserPermission
}

export const asComponent = new AsComponent()
