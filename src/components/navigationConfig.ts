import {
  mdiAccountCircleOutline,
  mdiCogOutline,
  mdiPhoneOutline,
} from '@mdi/js'

import { getAuthStore } from '../stores/authStore'
import intl from '../stores/intl'
import intlStore from '../stores/intlStore'
import Nav from '../stores/Nav'
import profileStore from '../stores/profileStore'
import RnAlert from '../stores/RnAlert'
import { arrToMap } from '../utils/toMap'

interface Menu {
  key: string
  icon: string
  subMenus: SubMenu[]
  defaultSubMenuKey: string
  defaultSubMenu: SubMenu
  subMenusMap: { [k: string]: SubMenu }
  navFn(): void
}
interface SubMenu {
  key: string
  label: string
  navFnKey: keyof ReturnType<typeof Nav>
  ucRequired?: boolean
  navFn(): void
}

const genMenus = () => {
  const arr = [
    {
      key: 'contact',
      icon: mdiAccountCircleOutline,
      subMenus: [
        {
          key: 'phonebook',
          label: intl`PHONEBOOK`,
          navFnKey: 'goToPageContactPhonebook',
        },
        {
          key: 'users',
          label: intl`USERS`,
          navFnKey: 'goToPageContactUsers',
        },
        {
          key: 'chat',
          label: intl`CHAT`,
          navFnKey: 'goToPageChatRecents',
          ucRequired: true,
        },
        {
          key: 'webchat',
          label: intl`WEBCHAT`,
          navFnKey: 'goToPageWebChat',
          ucRequired: true,
        },
      ],
      defaultSubMenuKey: 'users',
    },
    {
      key: 'call',
      icon: mdiPhoneOutline,
      subMenus: [
        {
          key: 'keypad',
          label: intl`KEYPAD`,
          navFnKey: 'goToPageCallKeypad',
        },
        {
          key: 'recents',
          label: intl`RECENTS`,
          navFnKey: 'goToPageCallRecents',
        },
        {
          key: 'parks',
          label: intl`PARKS`,
          navFnKey: 'goToPageCallParks',
        },
      ],
      defaultSubMenuKey: 'recents',
    },
    {
      key: 'settings',
      icon: mdiCogOutline,
      subMenus: [
        {
          key: 'profile',
          label: intl`CURRENT ACCOUNT`,
          navFnKey: 'goToPageSettingsProfile',
        },
        {
          key: 'other',
          label: intl`OTHER SETTINGS`,
          navFnKey: 'goToPageSettingsOther',
        },
      ],
      defaultSubMenuKey: 'profile',
    },
  ] as Menu[]
  //
  arr.forEach((m, i) => {
    m.subMenusMap = arrToMap(
      m.subMenus,
      (s: SubMenu) => s.key,
      (s: SubMenu) => s,
    ) as Menu['subMenusMap']
    m.defaultSubMenu = m.subMenusMap?.[m.defaultSubMenuKey]
    m.subMenus.forEach(s => {
      s.navFn = () => {
        if (s.ucRequired && !getAuthStore().currentProfile.ucEnabled) {
          m.defaultSubMenu.navFn()
          return
        }
        Nav()[s.navFnKey]()
        saveNavigation(i, s.key)
      }
    })
    m.navFn = () => {
      let k = getAuthStore().currentProfile.navSubMenus?.[i]
      if (!(k in m.subMenusMap)) {
        k = m.defaultSubMenuKey
      }
      m.subMenusMap[k].navFn()
    }
  })
  return arr
}

let lastLocale = intlStore.locale
let lastMenus = genMenus()
export const menus = () => {
  if (lastLocale !== intlStore.locale) {
    lastLocale = intlStore.locale
    lastMenus = genMenus()
  }
  return lastMenus
}

const saveNavigation = (i: number, k: string) => {
  const arr = menus()
  const m = arr[i]
  const p = getAuthStore().currentProfile
  if (!m || !p) {
    return
  }
  if (!(k in m.subMenusMap)) {
    k = m.defaultSubMenuKey
  }
  normalizeSavedNavigation()
  if (m.key !== 'settings') {
    p.navIndex = i
  }
  p.navSubMenus[i] = k
  profileStore.saveProfilesToLocalStorage()
}
export const normalizeSavedNavigation = () => {
  const arr = menus()
  const p = getAuthStore().currentProfile
  if (!arr[p.navIndex]) {
    p.navIndex = 0
  }
  if (p.navSubMenus?.length !== arr.length) {
    p.navSubMenus = arr.map(() => '')
  }
  arr.forEach((m, i) => {
    if (!(p.navSubMenus[i] in m.subMenusMap)) {
      p.navSubMenus[i] = m.defaultSubMenuKey
    }
  })
}

export const getTabs = (tab: string) => {
  const arr = [
    {
      key: 'call_transfer',
      icon: null,
      subMenus: [
        {
          key: 'list_user',
          label: intl`USER`,
          navFnKey: 'goToPageCallTransferChooseUser',
        },
        {
          key: 'external_number',
          label: intl`KEYPAD`,
          navFnKey: 'goToPageCallTransferDial',
        },
      ],
      defaultSubMenuKey: 'list_user',
    },
  ] as unknown as Menu[]

  arr.forEach((m, i) => {
    m.subMenusMap = arrToMap(
      m.subMenus,
      (s: SubMenu) => s.key,
      (s: SubMenu) => s,
    ) as Menu['subMenusMap']
    m.defaultSubMenu = m.subMenusMap?.[m.defaultSubMenuKey]
    m.subMenus.forEach(s => {
      s.navFn = () => {
        Nav()[s.navFnKey]()
      }
    })
  })
  const m = arr.find(m => m.key === tab)
  if (!m) {
    RnAlert.error({
      unexpectedErr: new Error(`Can not find sub menus for ${tab}`),
    })
    return []
  }
  return m.subMenus as SubMenu[]
}
export const getSubMenus = (menu: string) => {
  const arr = menus()
  const m = arr.find(m => m.key === menu)
  if (!m) {
    RnAlert.error({
      unexpectedErr: new Error(`Can not find sub menus for ${menu}`),
    })
    return []
  }
  return m.subMenus.filter(
    s => !(s.ucRequired && !getAuthStore().currentProfile.ucEnabled),
  )
}
