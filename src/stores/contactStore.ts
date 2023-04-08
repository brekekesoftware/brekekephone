import { debounce, isEqual, uniqBy } from 'lodash'
import { action, computed, observable } from 'mobx'

import * as brekekejs from '../api/brekekejs'
import { pbx } from '../api/pbx'
import { arrToMap } from '../utils/toMap'
import { getAuthStore, waitPbx } from './authStore'
import { intlDebug } from './intl'
import { intlStore } from './intlStore'
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
// export type PBContact = {
//   aid: string
//   display_name: string
//   phonebook: string
//   shared: boolean
//   loaded?: boolean
//   hidden: boolean
//   info: Phonebook
// }
export type ContactInfo = { [k: string]: string }
export type Phonebook = {
  id: string
  display_name: string
  phonebook: string
  shared: boolean
  loaded?: boolean
  // if user is empty, it is shared
  // if user is specified, it means it is belonged to that user
  user?: string
  info: ContactInfo
}
export type ItemPBForm = brekekejs.ItemPhonebook & {
  name: string
  disabled?: boolean
  value?: string
  onValueChange?: Function
  rule?: string
  hidden?: boolean | undefined
  label: string
  isFocus?: boolean
  maxLength: number
}

export type PickerItemOption = {
  onSelect: Function
  listOption: ItemPBForm[]
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
    await waitPbx()
    if (getAuthStore().pbxState !== 'success' || this.loading) {
      return
    }
    this.loading = true
    await pbx
      .getContacts({
        search_text: this.phonebookSearchTerm,
        offset: this.offset,
        limit: this.numberOfContactsPerPage,
      })
      .then(arr => {
        if (!arr) {
          return
        }

        this.setPhonebook(arr as Phonebook[])
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
  // delete function
  @observable selectedContactIds: { [id: string]: boolean } = {}
  @observable isDeleteState: boolean = false

  @action selectContactId = (userId: string) => {
    if (this.selectedContactIds[userId]) {
      delete this.selectedContactIds[userId]
    } else {
      this.selectedContactIds[userId] = true
    }
  }
  @action removeContacts = (ids: string[] | number[]) => {
    ids.forEach(id => {
      delete this.phoneBooksMap[id.toString()]
    })
    this.phoneBooks = Object.values(this.phoneBooksMap)
  }

  // Create/update contact
  @observable showPickerItem: PickerItemOption | null = null

  @action openPicker = (picker: PickerItemOption) => {
    this.showPickerItem = picker
  }

  @action dismissPicker = () => {
    this.showPickerItem = null
  }
  getManagerContact = (lang?: string) => {
    return window.Brekeke.Phonebook.getManager(lang ? lang : intlStore.locale)
  }
  getItemPhonebook = (lang?: string) => {
    return window.Brekeke.Phonebook.getManager(lang ? lang : intlStore.locale)
      ?.item
  }

  getManagerItemLang = () => {}
  getManageItems = (lang?: string) => {
    const items = window.Brekeke.Phonebook.getManager(
      lang ? lang : intlStore.locale,
    )?.item
    if (!items || !items.length) {
      return []
    }
    const newItems = items.map(i => {
      return {
        ...i,
        name: i.id,
        disabled: undefined,
        label: i.id.startsWith('$') ? i.caption : i.id,
        keyboardType: i.type === 'phone' ? 'numeric' : 'default',
        maxLength: 50,
      }
    }) as any as ItemPBForm[]
    return newItems
  }

  // pbxUsers
  @observable pbxUsers: PbxUser[] = []

  getPbxUsers = async () => {
    try {
      const ca = getAuthStore().getCurrentAccount()
      if (!ca) {
        return
      }
      const res = await pbx.getUsers(ca.pbxTenant)
      if (!res) {
        return
      }
      this.pbxUsers = res
        .filter(u => u[0] !== ca.pbxUsername)
        .map(id => ({ id: id[0], name: id[1] }))
    } catch (err) {
      RnAlert.error({
        message: intlDebug`Failed to load PBX users`,
        err: err as Error,
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
  @observable private extraPbxUsersMap: { [k: string]: PbxUser } = {}
  getPbxUserById = (id: string) => {
    const u = this.pbxUsersMap[id] || this.extraPbxUsersMap[id]
    if (!u && !this.extraPbxUsersLoadingMap[id]) {
      this.extraPbxUsersLoadingMap[id] = true
      this.extraPbxUsersBatch.push(id)
      this.getExtraPbxUsersBatch()
    }
    return u
  }

  private extraPbxUsersLoadingMap: { [k: string]: boolean } = {}
  private extraPbxUsersBatch: string[] = []
  private getExtraPbxUsersBatch = debounce(() => {
    const ids = this.extraPbxUsersBatch
    this.extraPbxUsersBatch = []
    pbx
      .getExtraUsers(ids)
      .then(
        action(arr => {
          arr?.forEach(u => {
            this.extraPbxUsersMap[u.id] = u
          })
        }),
      )
      .catch(() => {
        // mimic finally
      })
      .then(() =>
        ids.forEach(id => {
          delete this.extraPbxUsersLoadingMap[id]
        }),
      )
  }, 17)

  @observable ucUsers: UcUser[] = []
  updateUcUser = (u: UcUser) => {
    const u0 = this.getUcUserById(u.id)
    if (!u0) {
      return
    }
    if (isEqual(u0, u)) {
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

  @observable phoneBooks: Phonebook[] = []
  @observable pbxBooks: brekekejs.PbxBook[] = []

  @action loadPbxBoook = () => {
    this.pbxBooks = []
    pbx.getPhonebooks().then(res => {
      if (res) {
        this.pbxBooks = res
      }
    })
  }
  @action upsertPhonebook = (p: Phonebook) => {
    const p0 = this.getPhonebookById(p.id)
    if (!p0) {
      this.phoneBooks.push(p)
    } else {
      Object.assign(p0, p)
    }

    // update display name for recent call
    const partyNumber =
      p.info?.$tel_mobile || p.info?.$tel_work || p.info?.$tel_home
    if (partyNumber) {
      const ac = getAuthStore()
      ac.updatePartyNameRecentCall({ partyName: p.display_name, partyNumber })
    }

    this.phoneBooks = [...this.phoneBooks]
  }
  @action setPhonebook = (p: Phonebook | Phonebook[]) => {
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
    return arrToMap(this.phoneBooks, 'id', (u: Phonebook) => u) as {
      [k: string]: Phonebook
    }
  }

  getPhoneBookByPhoneNumber = (phoneNumber?: string) => {
    if (!phoneNumber) {
      return
    }
    return this.phoneBooks.filter(
      p =>
        p.info.$tel_mobile === phoneNumber ||
        p.info.$tel_home === phoneNumber ||
        p.info.$tel_work === phoneNumber,
    )?.[0]
  }
  getParkNameByParkNumber = (parkNumber?: string) => {
    if (!parkNumber) {
      return
    }
    const cp = getAuthStore().getCurrentAccount()
    if (!cp) {
      return
    }
    const arr =
      cp.parks?.map((p, i) => ({
        park: p,
        name: cp.parkNames?.[i] || '',
      })) || []
    const parks = uniqBy(arr, 'park')
    return parks.find(p => p.park === parkNumber)?.name
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
    this.showPickerItem = null
    this.pbxBooks = []
    this.alreadyLoadContactsFirstTime = false
    this.selectedContactIds = {}
  }
}

export const contactStore = new ContactStore()

export const getPartyName = (partyNumber?: string) =>
  (partyNumber && contactStore.getPbxUserById(partyNumber)?.name) ||
  contactStore.getPhoneBookByPhoneNumber(partyNumber)?.display_name ||
  contactStore.getParkNameByParkNumber(partyNumber)
