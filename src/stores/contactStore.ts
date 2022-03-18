import uniqBy from 'lodash/uniqBy'
import { action, computed, observable } from 'mobx'

import { pbx } from '../api/pbx'
import { arrToMap } from '../utils/toMap'
import { getAuthStore, waitPbx, waitSip, waitUc } from './authStore'
import { intlDebug } from './intl'
import { RnAlert } from './RnAlert'

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
  phonebook?: string
  user?: string
}

class ContactStore {
  @observable usersSearchTerm = ''
  @observable phonebookSearchTerm = ''
  @observable chatSearchTerm = ''
  @observable callSearchRecents = ''
  @observable loading = false
  @observable hasLoadmore = false
  @observable offset = 0
  numberOfContactsPerPage = 20

  loadContacts = async () => {
    if (getAuthStore().pbxState !== 'success' || this.loading) {
      return
    }
    this.loading = true

    await pbx
      .getContacts({
        search_text: this.phonebookSearchTerm,
        shared: getAuthStore().currentProfile?.displaySharedContacts || false,
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
  @action refreshContacts = () => {
    this.offset = 0
    this.loadContacts()
  }
  @observable pbxUsers: PbxUser[] = []

  getPbxUser = async () => {
    console.log('getPbxUser::')
    await waitPbx()
    console.log('getPbxUser::waitPbx')
    await waitUc()
    console.log('getPbxUser::waitUc')
    await waitSip()
    console.log('getPbxUser::waitSip')
    try {
      const p = getAuthStore().currentProfile
      const ids = await pbx.getUsers(p.pbxTenant)
      if (!ids) {
        return
      }
      console.log('getPbxUser::ids::', ids)
      // const userIds = ids.filter(id => id !== p.pbxUsername)
      const users = ids.map(id => {
        return { id, name: id }
      })
      // const users = await pbx.getOtherUsers(p.pbxTenant, userIds)
      // console.log('getPbxUser::pbxUsers::', users);
      // if (!users) {
      //   return
      // }

      this.pbxUsers = users
    } catch (error) {
      RnAlert.error({
        message: intlDebug`Failed to load PBX users`,
        err: error as Error,
      })
    }
  }
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
    if (this.offset > 0) {
      this.phoneBooks = uniqBy([...this.phoneBooks, ...p], 'id')
    } else {
      this.phoneBooks = uniqBy([...p], 'id')
    }
  }
  @computed private get phoneBooksMap() {
    return arrToMap(this.phoneBooks, 'id', (u: Phonebook2) => u) as {
      [k: string]: Phonebook2
    }
  }

  getPhoneBookByPhoneNumber = (phoneNumber?: string) => {
    if (!phoneNumber) {
      return
    }
    return this.phoneBooks.filter(
      p =>
        p.cellNumber === phoneNumber ||
        p.homeNumber === phoneNumber ||
        p.workNumber === phoneNumber,
    )?.[0]
  }
  getPhonebookById = (id: string) => {
    return this.phoneBooksMap[id]
  }

  clearStore = () => {
    this.phoneBooks = []
    this.ucUsers = []
    this.pbxUsers = []
    this.loading = false
    this.hasLoadmore = false
    this.alreadyLoadContactsFirstTime = false
  }
}

export const contactStore = new ContactStore()

export const getPartyName = (partyNumber?: string) =>
  (partyNumber && contactStore.getPbxUserById(partyNumber)?.name) ||
  contactStore.getPhoneBookByPhoneNumber(partyNumber)?.name
