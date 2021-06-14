import uniqBy from 'lodash/uniqBy'
import { action, computed, observable } from 'mobx'

import pbx from '../api/pbx'
import { arrToMap } from '../utils/toMap'
import { intlDebug } from './intl'
import RnAlert from './RnAlert'

export type PbxUser = {
  id: string
  name: string
  talkers?: {
    id: string
    status: string // 'calling' | 'ringing' | 'talking' | 'holding'
  }[]
}
export type UcUser = {
  id: string
  name: string
  avatar: string
  status: string // 'online' | 'offline' | 'idle' | 'busy'
  statusText: string
}
export type Phonebook2 = {
  id: string
  name: string
  book: string
  firstName: string
  lastName: string
  workNumber: string
  cellNumber: string
  homeNumber: string
  job: string
  company: string
  address: string
  email: string
  shared: boolean
  loaded?: boolean
  hidden: boolean
}

class ContactStore {
  @observable usersSearchTerm = ''
  @observable callSearchRecents = ''
  @observable loading = true
  @observable hasLoadmore = false
  @observable offset = 0
  numberOfContactsPerPage = 100

  loadContacts = async () => {
    this.loading = true
    await pbx
      .getContacts({
        shared: true,
        offset: this.offset,
        limit: this.numberOfContactsPerPage,
      })
      .then(arr => {
        if (!arr) {
          return
        }
        this.setPhonebook(arr as Phonebook2[])
        this.hasLoadmore = arr.length === this.numberOfContactsPerPage
      })
      .catch((err: Error) => {
        RnAlert.error({
          message: intlDebug`Failed to load contact list`,
          err,
        })
      })
    this.loading = false
  }

  @observable alreadyLoadContactsFirstTime = false
  @action loadContactsFirstTime = () => {
    if (this.alreadyLoadContactsFirstTime) {
      return
    }
    this.loadContacts().then(() => {
      this.alreadyLoadContactsFirstTime = true
    })
  }
  @action loadMoreContacts = () => {
    this.offset += this.numberOfContactsPerPage
    this.loadContacts()
  }

  @observable pbxUsers: PbxUser[] = []
  setTalkerStatus = (userId: string, talkerId: string, status: string) => {
    const u = this.getPbxUserById(userId)
    if (!u) {
      return
    }
    if (!u.talkers) {
      u.talkers = []
    }
    if (!status) {
      u.talkers = u.talkers.filter(t => t.id !== talkerId)
    } else {
      const talker = u.talkers.find(t => t.id === talkerId)
      if (!talker) {
        u.talkers.push({
          id: talkerId,
          status,
        })
      } else {
        talker.status = status
      }
    }
    this.pbxUsers = [...this.pbxUsers]
  }
  @computed private get pbxUsersMap() {
    return arrToMap(this.pbxUsers, 'id', (u: PbxUser) => u) as {
      [k: string]: PbxUser
    }
  }
  getPbxUserById = (id: string) => {
    return this.pbxUsersMap[id]
  }

  @observable ucUsers: UcUser[] = []
  updateUcUser = (u: UcUser) => {
    const u0 = this.getUcUserById(u.id)
    if (!u0) {
      return
    }
    Object.assign(u0, u)
    this.ucUsers = [...this.ucUsers]
  }
  @computed private get ucUsersMap() {
    return arrToMap(this.ucUsers, 'id', (u: UcUser) => u) as {
      [k: string]: UcUser
    }
  }
  getUcUserById = (id: string) => {
    return this.ucUsersMap[id]
  }

  @observable phoneBooks: Phonebook2[] = []
  @action upsertPhonebook = (p: Phonebook2) => {
    const p0 = this.getPhonebookById(p.id)
    if (!p0) {
      this.phoneBooks.push(p)
    } else {
      Object.assign(p0, p)
    }
    this.phoneBooks = [...this.phoneBooks]
  }
  @action setPhonebook = (p: Phonebook2 | Phonebook2[]) => {
    if (!p) {
      return
    }
    if (!Array.isArray(p)) {
      p = [p]
    }
    this.phoneBooks = uniqBy([...this.phoneBooks, ...p], 'id')
  }
  @computed private get phoneBooksMap() {
    return arrToMap(this.phoneBooks, 'id', (u: Phonebook2) => u) as {
      [k: string]: Phonebook2
    }
  }
  getPhonebookById = (id: string) => {
    return this.phoneBooksMap[id]
  }

  clearStore = () => {
    this.phoneBooks = []
    this.ucUsers = []
    this.pbxUsers = []
    this.loading = true
    this.hasLoadmore = false
    this.alreadyLoadContactsFirstTime = false
  }
}

export default new ContactStore()
