import PageBackgroundCalls from '../-call/PageBackgroundCalls'
import PageCallKeypad from '../-call/PageCallKeypad'
import PageCallManage from '../-call/PageCallManage'
import PageCallParks from '../-call/PageCallParks'
import PageCallParks2 from '../-call/PageCallParks2'
import PageCallRecents from '../-call/PageCallRecents'
import PageDtmfKeypad from '../-call/PageDtmfKeypad'
import PageTransferDial from '../-call/PageTransferDial'
import PageChatDetail from '../-chat/PageChatDetail'
import PageChatGroupCreate from '../-chat/PageChatGroupCreate'
import PageChatGroupDetail from '../-chat/PageChatGroupDetail'
import PageChatGroupInvite from '../-chat/PageChatGroupInvite'
import PageChatRecents from '../-chat/PageChatRecents'
import PageContactPhonebook from '../-contact/PageContactPhonebook'
import PageContactUsers from '../-contact/PageContactUsers'
import PagePhonebookCreate from '../-contact/PagePhonebookCreate'
import PagePhonebookUpdate from '../-contact/PagePhonebookUpdate'
import PageProfileCreate from '../-profile/PageProfileCreate'
import PageProfileSignIn from '../-profile/PageProfileSignIn'
import PageProfileUpdate from '../-profile/PageProfileUpdate'
import PageSettingsDebug from '../-settings/PageSettingsDebug'
import PageSettingsOther from '../-settings/PageSettingsOther'
import PageSettingsProfile from '../-settings/PageSettingsProfile'
import { menus, normalizeSavedNavigation } from '../shared/navigationConfig'
import authStore from './authStore'
import RnStacker from './RnStacker'

const go = RnStacker.createGoTo
const back = RnStacker.createBackTo

class Nav {
  goToPageProfileSignIn = go({ PageProfileSignIn }, true)
  backToPageProfileSignIn = back({ PageProfileSignIn }, true)
  goToPageChatRecents = go({ PageChatRecents }, true)
  backToPageChatRecents = back({ PageChatRecents }, true)
  goToPageContactPhonebook = go({ PageContactPhonebook }, true)
  backToPageContactPhonebook = back({ PageContactPhonebook }, true)
  goToPageContactUsers = go({ PageContactUsers }, true)
  backToPageContactUsers = back({ PageContactUsers }, true)
  goToPageCallKeypad = go({ PageCallKeypad }, true)
  backToPageCallKeypad = back({ PageCallKeypad }, true)
  goToPageCallRecents = go({ PageCallRecents }, true)
  backToPageCallRecents = back({ PageCallRecents }, true)
  goToPageSettingsOther = go({ PageSettingsOther }, true)
  backToPageSettingsOther = back({ PageSettingsOther }, true)
  goToPageCallParks = go({ PageCallParks }, true)
  backToPageCallParks = back({ PageCallParks }, true)
  goToPageSettingsProfile = go({ PageSettingsProfile }, true)
  backToPageSettingsProfile = back({ PageSettingsProfile }, true)

  goToPageProfileCreate = go({ PageProfileCreate })
  backToPageProfileCreate = back({ PageProfileCreate })
  goToPageProfileUpdate = go({ PageProfileUpdate })
  backToPageProfileUpdate = back({ PageProfileUpdate })
  goToPagePhonebookCreate = go({ PagePhonebookCreate })
  backToPagePhonebookCreate = back({ PagePhonebookCreate })
  goToPagePhonebookUpdate = go({ PagePhonebookUpdate })
  backToPagePhonebookUpdate = back({ PagePhonebookUpdate })
  goToPageCallManage = go({ PageCallManage })
  backToPageCallManage = back({ PageCallManage })
  goToPageBackgroundCalls = go({ PageBackgroundCalls })
  backToPageBackgroundCalls = back({ PageBackgroundCalls })
  goToPageTransferDial = go({ PageTransferDial })
  backToPageTransferDial = back({ PageTransferDial })
  goToPageDtmfKeypad = go({ PageDtmfKeypad })
  backToPageDtmfKeypad = back({ PageDtmfKeypad })
  goToPageChatDetail = go({ PageChatDetail })
  backToPageChatDetail = back({ PageChatDetail })
  goToPageChatGroupCreate = go({ PageChatGroupCreate })
  backToPageChatGroupCreate = back({ PageChatGroupCreate })
  goToPageChatGroupInvite = go({ PageChatGroupInvite })
  backToPageChatGroupInvite = back({ PageChatGroupInvite })
  goToPageChatGroupDetail = go({ PageChatGroupDetail })
  backToPageChatGroupDetail = back({ PageChatGroupDetail })
  goToPageSettingsDebug = go({ PageSettingsDebug })
  backToPageSettingsDebug = back({ PageSettingsDebug })
  goToPageCallParks2 = go({ PageCallParks2 })
  backToPageCallParks2 = back({ PageCallParks2 })

  goToPageIndex = () => {
    if (!authStore.currentProfile) {
      this.goToPageProfileSignIn()
      return
    }
    const arr = menus()
    normalizeSavedNavigation()
    const p = authStore.currentProfile
    const i = p.navIndex
    const k = p.navSubMenus[i]
    arr[i].subMenusMap[k].navFn()
  }
}

export default new Nav()
