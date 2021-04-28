import { observable } from 'mobx'

import { Conference } from '../api/brekekejs'
import uc from '../api/uc'

class webchatStore {
  @observable webchats: Conference[] = []

  upsertWebchats = (webchat: Conference) => {
    const w = this.webchats.filter(
      (item: Conference) => item.conf_id === webchat.conf_id,
    )
    if (w.length) {
      this.webchats = this.webchats.map(item => {
        const newItem = { ...webchat, texts: item.texts }
        return item.conf_id === webchat.conf_id ? newItem : item
      })
    } else {
      const newItem = { ...webchat, texts: [] as string[] }
      this.webchats.push(newItem)
    }
  }
  pushMessages = (conf_id?: string, message?: string) => {
    if (!conf_id || !message) {
      return
    }
    this.webchats = this.webchats.map(item => {
      const newItem = { ...item, texts: [...item.texts, message] } as Conference
      return item.conf_id === conf_id ? newItem : item
    })
  }
  removeWebchatItem = (conf_id: string) => {
    this.webchats = this.webchats.filter(item => item.conf_id !== conf_id)
  }
  getMessages = async (conf_id: string) => {
    const messages = await uc.peekWebchatConferenceText(conf_id)
    this.webchats = this.webchats.map(item => {
      const newItem = {
        ...item,
        texts: item.texts.concat(messages),
      } as Conference
      return item.conf_id === conf_id ? newItem : item
    })
  }
}

export default new webchatStore()
