import { ComponentProps } from 'react'

import { menus, normalizeSavedNavigation } from '../components/navigationConfig'
import { PageCallBackgrounds } from '../pages/PageCallBackgrounds'
import { PageCallDtmfKeypad } from '../pages/PageCallDtmfKeypad'
import { PageCallKeypad } from '../pages/PageCallKeypad'
import { PageCallManage } from '../pages/PageCallManage'
import { PageCallParks } from '../pages/PageCallParks'
import { PageCallParks2 } from '../pages/PageCallParks2'
import { PageCallRecents } from '../pages/PageCallRecents'
import { PageCallTransferChooseUser } from '../pages/PageCallTransferChooseUser'
import { PageCallTransferDial } from '../pages/PageCallTransferDial'
import { PageChatDetail } from '../pages/PageChatDetail'
import { PageChatGroupCreate } from '../pages/PageChatGroupCreate'
import { PageChatGroupDetail } from '../pages/PageChatGroupDetail'
import { PageChatGroupInvite } from '../pages/PageChatGroupInvite'
import { PageChatRecents } from '../pages/PageChatRecents'
import { PageContactEdit } from '../pages/PageContactEdit'
import { PageContactGroupCreate } from '../pages/PageContactGroupCreate'
import { PageContactGroupEdit } from '../pages/PageContactGroupEdit'
import { PageContactPhonebook } from '../pages/PageContactPhonebook'
import { PageContactUsers } from '../pages/PageContactUsers'
import { PagePhonebookCreate } from '../pages/PagePhonebookCreate'
import { PagePhonebookUpdate } from '../pages/PagePhonebookUpdate'
import { PageProfileCreate } from '../pages/PageProfileCreate'
import { PageProfileSignIn } from '../pages/PageProfileSignIn'
import { PageProfileUpdate } from '../pages/PageProfileUpdate'
import { PageSettingsDebug } from '../pages/PageSettingsDebug'
import { PageSettingsOther } from '../pages/PageSettingsOther'
import { PageSettingsProfile } from '../pages/PageSettingsProfile'
import { PageWebChat } from '../pages/PageWebChat'
import { getAuthStore } from './authStore'
import { setNav } from './Nav'
import { RnStacker } from './RnStacker'

export class Nav2 {
  // root account/login
  goToPageProfileSignIn = RnStacker.createGoTo<
    ComponentProps<typeof PageProfileSignIn>
  >({ PageProfileSignIn }, true)
  backToPageProfileSignIn = RnStacker.createBackTo<
    ComponentProps<typeof PageProfileSignIn>
  >({ PageProfileSignIn }, true)
  // root user/chat
  goToPageContactPhonebook = RnStacker.createGoTo<
    ComponentProps<typeof PageContactPhonebook>
  >({ PageContactPhonebook }, true)
  backToPageContactPhonebook = RnStacker.createBackTo<
    ComponentProps<typeof PageContactPhonebook>
  >({ PageContactPhonebook }, true)
  goToPageContactUsers = RnStacker.createGoTo<
    ComponentProps<typeof PageContactUsers>
  >({ PageContactUsers }, true)
  backToPageContactUsers = RnStacker.createBackTo<
    ComponentProps<typeof PageContactUsers>
  >({ PageContactUsers }, true)
  goToPageChatRecents = RnStacker.createGoTo<
    ComponentProps<typeof PageChatRecents>
  >({ PageChatRecents }, true)
  backToPageChatRecents = RnStacker.createBackTo<
    ComponentProps<typeof PageChatRecents>
  >({ PageChatRecents }, true)
  goToPageWebChat = RnStacker.createGoTo<ComponentProps<typeof PageWebChat>>(
    { PageWebChat },
    true,
  )
  backToPageWebChat = RnStacker.createBackTo<
    ComponentProps<typeof PageWebChat>
  >({ PageWebChat }, true)
  // root call
  goToPageCallKeypad = RnStacker.createGoTo<
    ComponentProps<typeof PageCallKeypad>
  >({ PageCallKeypad }, true)
  backToPageCallKeypad = RnStacker.createBackTo<
    ComponentProps<typeof PageCallKeypad>
  >({ PageCallKeypad }, true)
  goToPageCallRecents = RnStacker.createGoTo<
    ComponentProps<typeof PageCallRecents>
  >({ PageCallRecents }, true)
  backToPageCallRecents = RnStacker.createBackTo<
    ComponentProps<typeof PageCallRecents>
  >({ PageCallRecents }, true)
  goToPageCallParks = RnStacker.createGoTo<
    ComponentProps<typeof PageCallParks>
  >({ PageCallParks }, true)
  backToPageCallParks = RnStacker.createBackTo<
    ComponentProps<typeof PageCallParks>
  >({ PageCallParks }, true)
  // root settings
  goToPageSettingsOther = RnStacker.createGoTo<
    ComponentProps<typeof PageSettingsOther>
  >({ PageSettingsOther }, true)
  backToPageSettingsOther = RnStacker.createBackTo<
    ComponentProps<typeof PageSettingsOther>
  >({ PageSettingsOther }, true)
  goToPageSettingsProfile = RnStacker.createGoTo<
    ComponentProps<typeof PageSettingsProfile>
  >({ PageSettingsProfile }, true)
  backToPageSettingsProfile = RnStacker.createBackTo<
    ComponentProps<typeof PageSettingsProfile>
  >({ PageSettingsProfile }, true)

  // account
  goToPageProfileCreate = RnStacker.createGoTo<
    ComponentProps<typeof PageProfileCreate>
  >({ PageProfileCreate })
  backToPageProfileCreate = RnStacker.createBackTo<
    ComponentProps<typeof PageProfileCreate>
  >({ PageProfileCreate })
  goToPageProfileUpdate = RnStacker.createGoTo<
    ComponentProps<typeof PageProfileUpdate>
  >({ PageProfileUpdate })
  backToPageProfileUpdate = RnStacker.createBackTo<
    ComponentProps<typeof PageProfileUpdate>
  >({ PageProfileUpdate })
  goToPagePhonebookCreate = RnStacker.createGoTo<
    ComponentProps<typeof PagePhonebookCreate>
  >({ PagePhonebookCreate })
  backToPagePhonebookCreate = RnStacker.createBackTo<
    ComponentProps<typeof PagePhonebookCreate>
  >({ PagePhonebookCreate })
  goToPagePhonebookUpdate = RnStacker.createGoTo<
    ComponentProps<typeof PagePhonebookUpdate>
  >({ PagePhonebookUpdate })
  backToPagePhonebookUpdate = RnStacker.createBackTo<
    ComponentProps<typeof PagePhonebookUpdate>
  >({ PagePhonebookUpdate })
  // call
  goToPageCallManage = RnStacker.createGoTo<
    ComponentProps<typeof PageCallManage>
  >({ PageCallManage })
  backToPageCallManage = RnStacker.createBackTo<
    ComponentProps<typeof PageCallManage>
  >({ PageCallManage })
  goToPageCallBackgrounds = RnStacker.createGoTo<
    ComponentProps<typeof PageCallBackgrounds>
  >({ PageCallBackgrounds })
  backToPageCallBackgrounds = RnStacker.createBackTo<
    ComponentProps<typeof PageCallBackgrounds>
  >({ PageCallBackgrounds })
  goToPageCallTransferChooseUser = RnStacker.createGoTo<
    ComponentProps<typeof PageCallTransferChooseUser>
  >({ PageCallTransferChooseUser })
  backToPageCallTransferChooseUser = RnStacker.createBackTo<
    ComponentProps<typeof PageCallTransferChooseUser>
  >({ PageCallTransferChooseUser })
  goToPageCallTransferDial = RnStacker.createGoTo<
    ComponentProps<typeof PageCallTransferDial>
  >({ PageCallTransferDial })
  backToPageCallTransferDial = RnStacker.createBackTo<
    ComponentProps<typeof PageCallTransferDial>
  >({ PageCallTransferDial })
  goToPageCallParks2 = RnStacker.createGoTo<
    ComponentProps<typeof PageCallParks2>
  >({ PageCallParks2 })
  backToPageCallParks2 = RnStacker.createBackTo<
    ComponentProps<typeof PageCallParks2>
  >({ PageCallParks2 })
  goToPageCallDtmfKeypad = RnStacker.createGoTo<
    ComponentProps<typeof PageCallDtmfKeypad>
  >({ PageCallDtmfKeypad })
  backToPageCallDtmfKeypad = RnStacker.createBackTo<
    ComponentProps<typeof PageCallDtmfKeypad>
  >({ PageCallDtmfKeypad })
  // chat
  goToPageChatDetail = RnStacker.createGoTo<
    ComponentProps<typeof PageChatDetail>
  >({ PageChatDetail })
  backToPageChatDetail = RnStacker.createBackTo<
    ComponentProps<typeof PageChatDetail>
  >({ PageChatDetail })
  goToPageChatGroupCreate = RnStacker.createGoTo<
    ComponentProps<typeof PageChatGroupCreate>
  >({ PageChatGroupCreate })
  backToPageChatGroupCreate = RnStacker.createBackTo<
    ComponentProps<typeof PageChatGroupCreate>
  >({ PageChatGroupCreate })
  goToPageChatGroupInvite = RnStacker.createGoTo<
    ComponentProps<typeof PageChatGroupInvite>
  >({ PageChatGroupInvite })
  backToPageChatGroupInvite = RnStacker.createBackTo<
    ComponentProps<typeof PageChatGroupInvite>
  >({ PageChatGroupInvite })
  goToPageChatGroupDetail = RnStacker.createGoTo<
    ComponentProps<typeof PageChatGroupDetail>
  >({ PageChatGroupDetail })
  backToPageChatGroupDetail = RnStacker.createBackTo<
    ComponentProps<typeof PageChatGroupDetail>
  >({ PageChatGroupDetail })
  // settings
  goToPageSettingsDebug = RnStacker.createGoTo<
    ComponentProps<typeof PageSettingsDebug>
  >({ PageSettingsDebug })
  backToPageSettingsDebug = RnStacker.createBackTo<
    ComponentProps<typeof PageSettingsDebug>
  >({ PageSettingsDebug })

  //Contact Group
  goToPageContactEdit = RnStacker.createGoTo<
    ComponentProps<typeof PageContactEdit>
  >({
    PageContactEdit,
  })
  backToPageContactEdit = RnStacker.createBackTo<
    ComponentProps<typeof PageContactEdit>
  >({ PageContactEdit }, true)

  goToPageContactGroupCreate = RnStacker.createGoTo<
    ComponentProps<typeof PageContactGroupCreate>
  >({
    PageContactGroupCreate,
  })
  goToPageContactGroupEdit = RnStacker.createGoTo<
    ComponentProps<typeof PageContactGroupEdit>
  >({
    PageContactGroupEdit,
  })
  customPageIndex?: Function
  goToPageIndex = () => {
    const p = getAuthStore().getCurrentAccount()
    if (!p) {
      this.customPageIndex = undefined
      this.goToPageProfileSignIn()
      return
    }
    if (this.customPageIndex) {
      this.customPageIndex()
      this.customPageIndex = undefined
      return
    }
    const arr = menus()
    normalizeSavedNavigation()
    const i = p.navIndex
    const k = p.navSubMenus?.[i]
    arr[i].subMenusMap[k].navFn()
  }
}

setNav(new Nav2())
