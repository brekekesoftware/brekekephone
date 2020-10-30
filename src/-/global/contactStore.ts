import debounce from 'lodash/debounce'
import uniqBy from 'lodash/uniqBy'
import { action, computed, observable } from 'mobx'

import pbx from '../api/pbx'
import { intlDebug } from '../intl/intl'
import { arrToMap } from '../utils/toMap'
import Alert from './Alert'

class ContactStore {
  @observable usersSearchTerm = ''
  @observable callSearchRecents = ''
  @observable loading = true
  @observable hasLoadmore = false
  @observable offset = 0
  numberOfContactsPerPage = 100

  loadContacts = debounce(async () => {
    this.loading = true
    await pbx
      .getContacts({
        shared: true,
        offset: this.offset,
        limit: this.numberOfContactsPerPage,
      })
      .then(arr => {
        this.setPhonebook(arr)
        this.hasLoadmore = arr.length === this.numberOfContactsPerPage
      })
      .catch(err => {
        Alert.error({
          message: intlDebug`Failed to load contact list`,
          err,
        })
      })
    this.loading = false
  }, 500)

  @observable alreadyLoadContactsFirstTime = false
  @action loadContactsFirstTime = () => {
    if (this.alreadyLoadContactsFirstTime) {
      return
    }
    this.loadContacts()
    this.alreadyLoadContactsFirstTime = true
  }

  @action loadMoreContacts = () => {
    this.offset += this.numberOfContactsPerPage
    this.loadContacts()
  }

  // id
  // name
  // talkers?[]
  //   id
  //   status
  //     'calling'
  //     'ringing'
  //     'talking'
  //     'holding'
  @observable pbxUsers: any[] = []
  setTalkerStatus = (userId, talkerId, status) => {
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
    return arrToMap(this.pbxUsers, 'id', u => u)
  }
  getPBXUser = id => {
    return this._pbxUsersMap[id]
  }

  // id
  // name
  // avatar
  // status
  //   'online'
  //   'offline'
  //   'idle'
  //   'busy'
  // statusText
  @observable ucUsers: any[] = []
  updateUCUser = _u => {
    const u = this.getUCUser(_u.id)
    if (!u) {
      return
    }
    Object.assign(u, _u)
    this.ucUsers = [...this.ucUsers]
  }
  @computed get _ucUsersMap() {
    return arrToMap(this.ucUsers, 'id', u => u)
  }
  getUCUser = id => {
    return this._ucUsersMap[id]
  }

  // id
  // book
  // firstName
  // lastName
  // workNumber
  // cellNumber
  // homeNumber
  // job
  // company
  // address
  // email
  // shared
  @observable phoneBooks: any[] = []
  @computed get _phoneBooksMap() {
    return arrToMap(this.phoneBooks, 'id', u => u)
  }

  @action upsertPhonebook = _p => {
    const p = this.getPhonebook(_p.id)
    if (!p) {
      this.phoneBooks.push(_p)
    } else {
      Object.assign(p, _p)
    }
    this.phoneBooks = [...this.phoneBooks]
  }

  @action setPhonebook = _p => {
    if (!_p) {
      return
    }
    if (!Array.isArray(_p)) {
      _p = [_p]
    }
    this.phoneBooks = uniqBy([...this.phoneBooks, ..._p], 'id')
  }

  getPhonebook = id => {
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
