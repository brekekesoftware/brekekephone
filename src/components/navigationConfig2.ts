import { action } from 'mobx'
import { ReactComponentLike } from 'prop-types'

import { getAuthStore } from '../stores/authStore'
import { intl } from '../stores/intl'
import { RnAlert } from '../stores/RnAlert'
import { RnStacker } from '../stores/RnStacker'
import { arrToMap } from '../utils/arrToMap'
import { openLinkSafely, urls } from '../utils/deeplink'
import { Menu, SubMenu } from './navigationConfig'

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
  if (getAuthStore().phoneappliEnabled()) {
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
      unexpectedErr: new Error(`Can not find sub menus for ${tab}`),
    })
    return []
  }
  return m.subMenus as SubMenu[]
}
