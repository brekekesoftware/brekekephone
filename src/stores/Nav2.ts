import { menus, normalizeSavedNavigation } from '../components/navigationConfig'
import PageCallBackgrounds from '../pages/PageCallBackgrounds'
import PageCallDtmfKeypad from '../pages/PageCallDtmfKeypad'
import PageCallKeypad from '../pages/PageCallKeypad'
import PageCallManage from '../pages/PageCallManage'
import PageCallParks from '../pages/PageCallParks'
import PageCallParks2 from '../pages/PageCallParks2'
import PageCallRecents from '../pages/PageCallRecents'
import PageCallTransferChooseUser from '../pages/PageCallTransferChooseUser'
import PageCallTransferDial from '../pages/PageCallTransferDial'
import PageChatDetail from '../pages/PageChatDetail'
import PageChatGroupCreate from '../pages/PageChatGroupCreate'
import PageChatGroupDetail from '../pages/PageChatGroupDetail'
import PageChatGroupInvite from '../pages/PageChatGroupInvite'
import PageChatRecents from '../pages/PageChatRecents'
import PageContactPhonebook from '../pages/PageContactPhonebook'
import PageContactUsers from '../pages/PageContactUsers'
import PagePhonebookCreate from '../pages/PagePhonebookCreate'
import PagePhonebookUpdate from '../pages/PagePhonebookUpdate'
import PageProfileCreate from '../pages/PageProfileCreate'
import PageProfileSignIn from '../pages/PageProfileSignIn'
import PageProfileUpdate from '../pages/PageProfileUpdate'
import PageSettingsDebug from '../pages/PageSettingsDebug'
import PageSettingsOther from '../pages/PageSettingsOther'
import PageSettingsProfile from '../pages/PageSettingsProfile'
import PageWebChat from '../pages/PageWebChat'
import { getAuthStore } from './authStore'
import { setNav } from './Nav'
import RnStacker from './RnStacker'

const go = RnStacker.createGoTo
const back = RnStacker.createBackTo
export class Nav {
  // root account/login
  goToPageProfileSignIn = go({ PageProfileSignIn }, true)
  backToPageProfileSignIn = back({ PageProfileSignIn }, true)
  // root user/chat
  goToPageContactPhonebook = go({ PageContactPhonebook }, true)
  backToPageContactPhonebook = back({ PageContactPhonebook }, true)
  goToPageContactUsers = go({ PageContactUsers }, true)
  backToPageContactUsers = back({ PageContactUsers }, true)
  goToPageChatRecents = go({ PageChatRecents }, true)
  backToPageChatRecents = back({ PageChatRecents }, true)
  goToPageWebChat = go({ PageWebChat }, true)
  backToPageWebChat = back({ PageWebChat }, true)
  // root call
  goToPageCallKeypad = go({ PageCallKeypad }, true)
  backToPageCallKeypad = back({ PageCallKeypad }, true)
  goToPageCallRecents = go({ PageCallRecents }, true)
  backToPageCallRecents = back({ PageCallRecents }, true)
  goToPageCallParks = go({ PageCallParks }, true)
  backToPageCallParks = back({ PageCallParks }, true)
  // root settings
  goToPageSettingsOther = go({ PageSettingsOther }, true)
  backToPageSettingsOther = back({ PageSettingsOther }, true)
  goToPageSettingsProfile = go({ PageSettingsProfile }, true)
  backToPageSettingsProfile = back({ PageSettingsProfile }, true)

  // account
  goToPageProfileCreate = go({ PageProfileCreate })
  backToPageProfileCreate = back({ PageProfileCreate })
  goToPageProfileUpdate = go({ PageProfileUpdate })
  backToPageProfileUpdate = back({ PageProfileUpdate })
  goToPagePhonebookCreate = go({ PagePhonebookCreate })
  backToPagePhonebookCreate = back({ PagePhonebookCreate })
  goToPagePhonebookUpdate = go({ PagePhonebookUpdate })
  backToPagePhonebookUpdate = back({ PagePhonebookUpdate })
  // call
  goToPageCallManage = go({ PageCallManage })
  backToPageCallManage = back({ PageCallManage })
  goToPageCallBackgrounds = go({ PageCallBackgrounds })
  backToPageCallBackgrounds = back({ PageCallBackgrounds })
  goToPageCallTransferChooseUser = go({ PageCallTransferChooseUser })
  backToPageCallTransferChooseUser = back({ PageCallTransferChooseUser })
  goToPageCallTransferDial = go({ PageCallTransferDial })
  backToPageCallTransferDial = back({ PageCallTransferDial })
  goToPageCallParks2 = go({ PageCallParks2 })
  backToPageCallParks2 = back({ PageCallParks2 })
  goToPageCallDtmfKeypad = go({ PageCallDtmfKeypad })
  backToPageCallDtmfKeypad = back({ PageCallDtmfKeypad })
  // chat
  goToPageChatDetail = go({ PageChatDetail })
  backToPageChatDetail = back({ PageChatDetail })
  goToPageChatGroupCreate = go({ PageChatGroupCreate })
  backToPageChatGroupCreate = back({ PageChatGroupCreate })
  goToPageChatGroupInvite = go({ PageChatGroupInvite })
  backToPageChatGroupInvite = back({ PageChatGroupInvite })
  goToPageChatGroupDetail = go({ PageChatGroupDetail })
  backToPageChatGroupDetail = back({ PageChatGroupDetail })
  // settings
  goToPageSettingsDebug = go({ PageSettingsDebug })
  backToPageSettingsDebug = back({ PageSettingsDebug })

  goToPageIndex = () => {
    if (!getAuthStore().currentProfile) {
      this.goToPageProfileSignIn()
      return
    }
    const arr = menus()
    normalizeSavedNavigation()
    const p = getAuthStore().currentProfile
    const i = p.navIndex
    const k = p.navSubMenus?.[i]
    arr[i].subMenusMap[k].navFn()
  }
}

setNav(new Nav())
