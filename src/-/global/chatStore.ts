import sortBy from 'lodash/sortBy'
import uniq from 'lodash/uniq'
import { computed, observable } from 'mobx'

import { arrToMap } from '../utils/toMap'
import authStore from './authStore'

class ChatStore {
  // id
  // text
  // file
  // created
  // creator
  @observable messagesByThreadId = {}
  @observable threadConfig = {}
  @computed get unreadCount() {
    const idMap = {}
    const l1 = Object.values(this.threadConfig).filter((v: any) => {
      idMap[v.id] = true
      return v.isUnread && this.messagesByThreadId[v.id]?.length
    }).length
    const l2 = authStore.currentData.recentChats.filter(
      c => !idMap[c.id] && c.unread,
    ).length
    return l1 + l2
  }
  // threadId can be uc user id or group id
  // TODO threadId can be duplicated between them
  @computed get threadIdsOrderedByRecent() {
    return sortBy(
      Object.keys(this.messagesByThreadId),
      k => this.messagesByThreadId[k].created,
    )
  }
  pushMessages = (threadId, _m, isUnread = false) => {
    if (!Array.isArray(_m)) {
      _m = [_m]
    }
    const messages = this.messagesByThreadId[threadId] || []
    messages.push(..._m)
    this.messagesByThreadId[threadId] = sortBy(uniq(messages, 'id'), 'created')
    const isGroup = this.groups.some((g: any) => g.id === threadId)
    this.updateThreadConfig(threadId, isGroup, {
      isUnread,
    })
  }

  getThreadConfig = id => this.threadConfig[id] || {}
  updateThreadConfig = (id, isGroup, c) => {
    this.threadConfig = {
      ...this.threadConfig,
      [id]: {
        ...this.getThreadConfig(id),
        ...c,
        id,
        isGroup,
      },
    }
  }

  // id
  // name
  // incoming
  // size
  // state
  //   'waiting'
  //   'started'
  //   'success'
  //   'stopped'
  //   'failure'
  // transferPercent
  @observable filesMap = {}
  upsertFile = _f => {
    const f = this.filesMap[_f.id]
    this.filesMap[_f.id] = f ? Object.assign(f, _f) : _f
  }
  removeFile = id => {
    delete this.filesMap[id]
  }

  // id
  // name
  // inviter
  // jointed
  // members
  @observable groups: any = []
  upsertGroup = _g => {
    const g = this.getGroup(_g.id)
    if (g) {
      Object.assign(g, _g)
    } else {
      this.groups.push(_g)
    }
    this.groups = [...this.groups]
  }
  removeGroup = id => {
    delete this.messagesByThreadId[id]
    delete this.threadConfig[id]
    this.groups = this.groups.filter(g => g.id !== id)
  }
  //
  @computed get _groupsMap() {
    return arrToMap(this.groups, 'id', g => g)
  }
  getGroup = id => {
    return this._groupsMap[id]
  }

  clearStore = () => {
    this.messagesByThreadId = {}
    this.threadConfig = {}
    this.groups = []
    this.filesMap = {}
  }
}

export default new ChatStore()
