import {
  mdiAccountCircleOutline,
  mdiCogOutline,
  mdiPhoneOutline,
} from '../assets/icons'
import { PbxCustomPage } from '../brekekejs'
import { accountStore } from '../stores/accountStore'
import { getAuthStore } from '../stores/authStore'
import { intl } from '../stores/intl'
import { intlStore } from '../stores/intlStore'
import { Nav } from '../stores/Nav'
import { RnAlert } from '../stores/RnAlert'
import { arrToMap } from '../utils/arrToMap'
import { openLinkSafely, URLSchemes } from '../utils/deeplink'

export type Menu = {
  key: string
  icon: string
  subMenus: SubMenu[]
  defaultSubMenuKey: string
  defaultSubMenu: SubMenu
  subMenusMap: { [k: string]: SubMenu }
  navFn(): void
}
export type SubMenu = {
  key: string
  label: string
  navFnKey: keyof ReturnType<typeof Nav>
  ucRequired?: boolean
  navFn(): void
}
const getSettingSubMenus = (customPages: PbxCustomPage[], isLeft = false) => {
  return customPages
    .filter(
      c =>
        c.pos.includes('setting') &&
        c.pos.includes(isLeft ? 'left' : 'right') &&
        c.pos.split(',')?.[2],
    )
    .sort(
      (a, b) =>
        parseInt(a.pos.split(',')?.[2]) - parseInt(b.pos.split(',')?.[2]),
    )
    .map(i => {
      return { key: i.id, label: i.title, navFnKey: 'goToPageCustomPage' }
    })
}
const genMenus = (customPages: PbxCustomPage[]) => {
  const settingSubMenusLeft = getSettingSubMenus(customPages, true)
  const settingSubMenusRight = getSettingSubMenus(customPages, false)
  const settingSubMenus = [
    ...settingSubMenusLeft,
    {
      key: 'account',
      label: intl`CURRENT ACCOUNT`,
      navFnKey: 'goToPageSettingsCurrentAccount',
    },
    {
      key: 'other',
      label: intl`OTHER SETTINGS`,
      navFnKey: 'goToPageSettingsOther',
    },
    ...settingSubMenusRight,
  ]

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
        {
          key: 'voicemail',
          label: intl`VOICEMAIL`,
          navFnKey: 'goToPageVoicemail',
        },
      ],
      defaultSubMenuKey: 'keypad',
    },
    {
      key: 'settings',
      icon: mdiCogOutline,
      subMenus: settingSubMenus,
      defaultSubMenuKey: 'account',
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
        const as = getAuthStore()
        const ca = as.getCurrentAccount()
        if (s.ucRequired && !ca?.ucEnabled) {
          m.defaultSubMenu.navFn()
          return
        }

        // handle link to phoneappli app
        if (as.phoneappliEnabled()) {
          if (s.navFnKey === 'goToPageContactPhonebook') {
            openLinkSafely(URLSchemes.phoneappli.USERS)
            return
          }
          if (
            s.navFnKey === 'goToPageCallRecents' ||
            s.navFnKey === 'backToPageCallRecents'
          ) {
            openLinkSafely(URLSchemes.phoneappli.HISTORY_CALLED)
            return
          }
        }
        // @ts-ignore
        Nav()[s.navFnKey]({ id: s.key })
        saveNavigation(i, s.key)
      }
    })
    m.navFn = () => {
      let k = getAuthStore().getCurrentAccount()?.navSubMenus?.[i]
      if (!k) {
        return
      }
      if (!(k in m.subMenusMap)) {
        k = m.defaultSubMenuKey
      }
      m.subMenusMap[k].navFn()
    }
  })
  return arr
}

let lastLocale = intlStore.locale
let lastMenus = genMenus([])
export const menus = () => {
  if (lastLocale !== intlStore.locale) {
    lastLocale = intlStore.locale
  }
  lastMenus = genMenus(getAuthStore().listCustomPage)
  return lastMenus
}

const saveNavigation = (i: number, k: string) => {
  const arr = menus()
  const m = arr[i]
  const ca = getAuthStore().getCurrentAccount()
  if (!m || !ca) {
    return
  }
  if (!(k in m.subMenusMap)) {
    k = m.defaultSubMenuKey
  }
  normalizeSavedNavigation()
  if (m.key !== 'settings') {
    ca.navIndex = i
  }
  ca.navSubMenus[i] = k
  accountStore.saveAccountsToLocalStorageDebounced()
}
export const normalizeSavedNavigation = () => {
  const arr = menus()
  const ca = getAuthStore().getCurrentAccount()
  if (!ca) {
    return
  }
  if (!arr[ca.navIndex]) {
    ca.navIndex = 0
  }
  if (ca.navSubMenus?.length !== arr.length) {
    ca.navSubMenus = arr.map(() => '')
  }
  arr.forEach((m, i) => {
    if (!(ca.navSubMenus[i] in m.subMenusMap)) {
      ca.navSubMenus[i] = m.defaultSubMenuKey
    }
  })
}

export const getSubMenus = (menu: string) => {
  const arr = menus()
  const m = arr.find(_ => _.key === menu)
  if (!m) {
    RnAlert.error({
      unexpectedErr: new Error(`Can not find sub menus for ${menu}`),
    })
    return []
  }
  return m.subMenus.filter(
    s => !(s.ucRequired && !getAuthStore().getCurrentAccount()?.ucEnabled),
  )
}
