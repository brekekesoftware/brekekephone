import { action } from 'mobx'
import type { ReactComponentLike } from 'prop-types'

import { isCustomPageUrlBuilt } from '#/api/customPage'
import { buildCustomPageUrl } from '#/api/pbx'
import {
  mdiAccountCircleOutline,
  mdiCogOutline,
  mdiPhoneOutline,
} from '#/assets/icons'
import type { PbxCustomPage } from '#/brekekejs'
import { isIos } from '#/config'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import type { Nav } from '#/stores/Nav'
import { RnAlert } from '#/stores/RnAlert'
import { RnStacker } from '#/stores/RnStacker'
import { arrToMap } from '#/utils/arrToMap'
import { openLinkSafely, urls } from '#/utils/deeplink'
import { PushNotification } from '#/utils/PushNotification'

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
  navFnKey: keyof Nav
  ucRequired?: boolean
  navFn(): void
}
const getSettingSubMenus = (customPages: PbxCustomPage[], isLeft = false) =>
  customPages
    .filter(
      c =>
        c.pos.includes('setting') &&
        c.pos.includes(isLeft ? 'left' : 'right') &&
        c.pos.split(',')?.[2],
    )
    .sort((a, b) => {
      const aOrder = parseInt(a.pos.split(',')?.[2])
      const bOrder = parseInt(b.pos.split(',')?.[2])
      return isLeft ? aOrder - bOrder : bOrder - aOrder
    })
    .map(i => ({ key: i.id, label: i.title, navFnKey: 'goToPageCustomPage' }))
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
        const ca = ctx.auth.getCurrentAccount()
        if (s.ucRequired && !ca?.ucEnabled) {
          m.defaultSubMenu.navFn()
          return
        }

        // handle link to phoneappli app
        if (ctx.auth.phoneappliEnabled()) {
          if (s.navFnKey === 'goToPageContactPhonebook') {
            openLinkSafely(urls.phoneappli.USERS)
            return
          }
          if (
            s.navFnKey === 'goToPageCallRecents' ||
            s.navFnKey === 'backToPageCallRecents'
          ) {
            if (isIos) {
              PushNotification.resetBadgeNumber()
            }
            openLinkSafely(urls.phoneappli.HISTORY_CALLED)
            return
          }
        }

        // should update custom page URL if not built
        const updateCustomPageUrl = async (i: PbxCustomPage) => {
          if (isCustomPageUrlBuilt(i.url)) {
            return
          }
          const url = await buildCustomPageUrl(i.url)
          ctx.auth.updateCustomPage({ ...i, url })
          ctx.auth.customPageLoadings[i.id] = true
        }

        if (s.navFnKey === 'goToPageCustomPage') {
          const cp = ctx.auth.getCustomPageById(s.key)
          if (!cp) {
            return
          }
          updateCustomPageUrl(cp)
          ctx.auth.activeCustomPageId = s.key
        }
        // @ts-ignore
        ctx.nav[s.navFnKey]({ id: s.key })
        saveNavigation(i, s.key)
      }
    })
    m.navFn = () => {
      let k = ctx.auth.getCurrentAccount()?.navSubMenus?.[i]
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

let lastLocale = ctx.intl.locale
let lastMenus = genMenus([])
export const menus = () => {
  if (lastLocale !== ctx.intl.locale) {
    lastLocale = ctx.intl.locale
  }
  lastMenus = genMenus(ctx.auth.listCustomPage)
  return lastMenus
}

const saveNavigation = (i: number, k: string) => {
  const arr = menus()
  const m = arr[i]
  const ca = ctx.auth.getCurrentAccount()
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
  ctx.account.saveAccountsToLocalStorageDebounced()
}
export const normalizeSavedNavigation = () => {
  const arr = menus()
  const ca = ctx.auth.getCurrentAccount()
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
      unexpectedErr: new Error(intl`Can not find sub menus for ${menu}`),
    })
    return []
  }
  return m.subMenus.filter(
    s => !(s.ucRequired && !ctx.auth.getCurrentAccount()?.ucEnabled),
  )
}

let PageCallTransferChooseUser: ReactComponentLike
export const setPageCallTransferChooseUser = (p: ReactComponentLike) => {
  PageCallTransferChooseUser = p
}
let PageCallTransferDial: ReactComponentLike
export const setPageCallTransferDial = (p: ReactComponentLike) => {
  PageCallTransferDial = p
}

export const getTabs = (tab: string) => {
  const subMenus = [
    {
      key: 'list_user',
      label: intl`USER`,
      navFnKey: { PageCallTransferChooseUser },
    },
    {
      key: 'external_number',
      label: intl`KEYPAD`,
      navFnKey: { PageCallTransferDial },
    },
  ]
  // add phonebook tab if phoneappli is enabled
  if (ctx.auth.phoneappliEnabled()) {
    subMenus.push({
      key: 'phonebook',
      label: intl`PHONEBOOK`,
      navFnKey: {} as any,
    })
  }

  const arr = [
    {
      key: 'call_transfer',
      icon: null,
      subMenus,
      defaultSubMenuKey: 'list_user',
    },
  ] as any as Menu[]

  const subMenuNames = arr[0].subMenus.map(s => Object.keys(s.navFnKey)[0])

  arr.forEach((m, i) => {
    m.subMenusMap = arrToMap(
      m.subMenus,
      (s: SubMenu) => s.key,
      (s: SubMenu) => s,
    ) as Menu['subMenusMap']
    m.defaultSubMenu = m.subMenusMap?.[m.defaultSubMenuKey]
    m.subMenus.forEach(s => {
      s.navFn = action(() => {
        const name = Object.keys(s.navFnKey)[0]
        // handle link to phoneappli app
        if (!name || s.key === 'phonebook') {
          openLinkSafely(urls.phoneappli.USERS)
          return
        }
        // @ts-ignore
        const Component: ReactComponentLike = s.navFnKey[name]
        const lastStack = RnStacker.stacks.pop()
        if (lastStack && !subMenuNames.includes(lastStack.name)) {
          RnStacker.stacks.push(lastStack)
        }
        RnStacker.stacks.push({
          name,
          Component,
        })
      })
    })
  })
  const m = arr.find(_ => _.key === tab)
  if (!m) {
    RnAlert.error({
      unexpectedErr: new Error(intl`Can not find sub menus for ${tab}`),
    })
    return []
  }
  return m.subMenus as SubMenu[]
}
