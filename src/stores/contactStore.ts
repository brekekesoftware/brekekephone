import uniqBy from 'lodash/uniqBy'
import { action, computed, observable } from 'mobx'

import { getContactByNumber } from '../api/CallApi'
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
    this.loadContacts()?.then(() => {
      this.alreadyLoadContactsFirstTime = true
    })
  }

  @action loadMoreContacts = () => {
    this.offset += this.numberOfContactsPerPage
    this.loadContacts()
  }

  @observable pbxUsers: PbxUser[] = []
  setTalkerStatus = (userId: string, talkerId: string, status: string) => {
    const user = this.getPBXUser(userId)
    if (!user) {
      return
    }
    if (!user.talkers) {
      user.talkers = []
    }
    if (!status) {
      user.talkers = user.talkers.filter(t => t.id !== talkerId)
    } else {
      const talker = user.talkers.find(t => t.id === talkerId)
      if (!talker) {
        user.talkers.push({
          id: talkerId,
          status,
        })
      } else {
        talker.status = status
      }
    }
    this.pbxUsers = [...this.pbxUsers]
  }
  //
  @computed get _pbxUsersMap() {
    return arrToMap(this.pbxUsers, 'id', (u: PbxUser) => u) as {
      [k: string]: PbxUser
    }
  }
  getPBXUser = (id: string) => {
    return this._pbxUsersMap[id]
  }

  getPartyName = async (id: string, callback: Function) => {
    await getContactByNumber({ search_text: id })
      .then(res => {
        if (res && res.length) {
          callback(res[0].name)
        } else {
          callback('')
        }
      })
      .catch(err => callback(''))
  }

  @observable ucUsers: UcUser[] = []
  updateUCUser = (_u: UcUser) => {
    const u = this.getUCUser(_u.id)
    if (!u) {
      return
    }
    Object.assign(u, _u)
    this.ucUsers = [...this.ucUsers]
  }
  @computed get _ucUsersMap() {
    return arrToMap(this.ucUsers, 'id', (u: UcUser) => u) as {
      [k: string]: UcUser
    }
  }
  getUCUser = (id: string) => {
    return this._ucUsersMap[id]
  }

  @observable phoneBooks: Phonebook2[] = []
  @computed get _phoneBooksMap() {
    return arrToMap(this.phoneBooks, 'id', (u: Phonebook2) => u) as {
      [k: string]: Phonebook2
    }
  }

  @action upsertPhonebook = (_p: Phonebook2) => {
    const p = this.getPhonebook(_p.id)
    if (!p) {
      this.phoneBooks.push(_p)
    } else {
      Object.assign(p, _p)
    }
    this.phoneBooks = [...this.phoneBooks]
  }

  @action setPhonebook = (_p: Phonebook2 | Phonebook2[]) => {
    if (!_p) {
      return
    }
    if (!Array.isArray(_p)) {
      _p = [_p]
    }
    this.phoneBooks = uniqBy([...this.phoneBooks, ..._p], 'id')
  }

  getPhonebook = (id: string) => {
    return this._phoneBooksMap[id]
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
