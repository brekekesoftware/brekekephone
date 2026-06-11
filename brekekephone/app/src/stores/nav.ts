import type { ComponentProps } from 'react'
import { Keyboard } from 'react-native'

import { menus, normalizeSavedNavigation } from '#/components/navigation-config'
import { PageAccountCreate } from '#/pages/page-account-create'
import { PageAccountSignIn } from '#/pages/page-account-sign-in'
import { PageAccountUpdate } from '#/pages/page-account-update'
import { PageCallBackgrounds } from '#/pages/page-call-backgrounds'
import { PageCallDtmfKeypad } from '#/pages/page-call-dtmf-keypad'
import { PageCallKeypad } from '#/pages/page-call-keypad'
import { PageCallParks } from '#/pages/page-call-parks'
import { PageCallParksOngoing } from '#/pages/page-call-parks-ongoing'
import { PageCallRecents } from '#/pages/page-call-recents'
import { PageCallTransferChooseUser } from '#/pages/page-call-transfer-choose-user'
import { PageCallTransferDial } from '#/pages/page-call-transfer-dial'
import { PageChatDetail } from '#/pages/page-chat-detail'
import { PageChatGroupCreate } from '#/pages/page-chat-group-create'
import { PageChatGroupDetail } from '#/pages/page-chat-group-detail'
import { PageChatGroupInvite } from '#/pages/page-chat-group-invite'
import { PageChatRecents } from '#/pages/page-chat-recents'
import { PageContactEdit } from '#/pages/page-contact-edit'
import { PageContactGroupCreate } from '#/pages/page-contact-group-create'
import { PageContactGroupEdit } from '#/pages/page-contact-group-edit'
import { PageContactPhonebook } from '#/pages/page-contact-phonebook'
import { PageContactUsers } from '#/pages/page-contact-users'
import { PageCustomPage } from '#/pages/page-custom-page'
import { PagePhonebookCreate } from '#/pages/page-phonebook-create'
import { PagePhonebookUpdate } from '#/pages/page-phonebook-update'
import { PageSettingsCurrentAccount } from '#/pages/page-settings-current-account'
import { PageSettingsDebug } from '#/pages/page-settings-debug'
import { PageSettingsDebugFiles } from '#/pages/page-settings-debug-files'
import { PageSettingsOther } from '#/pages/page-settings-other'
import { PageVoicemail } from '#/pages/page-voicemail'
import { PageWebChat } from '#/pages/page-web-chat'
import type { CallStore } from '#/stores/call-store'
import { ctx } from '#/stores/ctx'
import { RnKeyboard } from '#/stores/rn-keyboard'
import { RnStacker } from '#/stores/rn-stacker'
import { BrekekeUtils } from '#/utils/brekeke-utils'

export class Nav {
  // root account/login
  goToPageAccountSignIn = RnStacker.createGoTo<
    ComponentProps<typeof PageAccountSignIn>
  >(
    {
      PageAccountSignIn,
    },
    true,
  )
  backToPageAccountSignIn = RnStacker.createBackTo<
    ComponentProps<typeof PageAccountSignIn>
  >(
    {
      PageAccountSignIn,
    },
    true,
  )

  // root user/chat
  goToPageContactPhonebook = RnStacker.createGoTo<
    ComponentProps<typeof PageContactPhonebook>
  >(
    {
      PageContactPhonebook,
    },
    true,
  )
  backToPageContactPhonebook = RnStacker.createBackTo<
    ComponentProps<typeof PageContactPhonebook>
  >(
    {
      PageContactPhonebook,
    },
    true,
  )
  goToPageContactUsers = RnStacker.createGoTo<
    ComponentProps<typeof PageContactUsers>
  >(
    {
      PageContactUsers,
    },
    true,
  )
  backToPageContactUsers = RnStacker.createBackTo<
    ComponentProps<typeof PageContactUsers>
  >(
    {
      PageContactUsers,
    },
    true,
  )
  goToPageChatRecents = RnStacker.createGoTo<
    ComponentProps<typeof PageChatRecents>
  >(
    {
      PageChatRecents,
    },
    true,
  )
  backToPageChatRecents = RnStacker.createBackTo<
    ComponentProps<typeof PageChatRecents>
  >(
    {
      PageChatRecents,
    },
    true,
  )
  goToPageWebChat = RnStacker.createGoTo<ComponentProps<typeof PageWebChat>>(
    {
      PageWebChat,
    },
    true,
  )
  backToPageWebChat = RnStacker.createBackTo<
    ComponentProps<typeof PageWebChat>
  >(
    {
      PageWebChat,
    },
    true,
  )

  // root call
  goToPageCallKeypad = RnStacker.createGoTo<
    ComponentProps<typeof PageCallKeypad>
  >(
    {
      PageCallKeypad,
    },
    true,
  )
  backToPageCallKeypad = RnStacker.createBackTo<
    ComponentProps<typeof PageCallKeypad>
  >(
    {
      PageCallKeypad,
    },
    true,
  )
  goToPageCallRecents = RnStacker.createGoTo<
    ComponentProps<typeof PageCallRecents>
  >(
    {
      PageCallRecents,
    },
    true,
  )
  backToPageCallRecents = RnStacker.createBackTo<
    ComponentProps<typeof PageCallRecents>
  >(
    {
      PageCallRecents,
    },
    true,
  )

  goToPageVoicemail = RnStacker.createGoTo<
    ComponentProps<typeof PageVoicemail>
  >(
    {
      PageVoicemail,
    },
    true,
  )

  backToPageVoicemail = RnStacker.createBackTo<
    ComponentProps<typeof PageVoicemail>
  >(
    {
      PageVoicemail,
    },
    true,
  )

  goToPageCallParks = RnStacker.createGoTo<
    ComponentProps<typeof PageCallParks>
  >(
    {
      PageCallParks,
    },
    true,
  )
  backToPageCallParks = RnStacker.createBackTo<
    ComponentProps<typeof PageCallParks>
  >(
    {
      PageCallParks,
    },
    true,
  )

  // root settings
  goToPageSettingsOther = RnStacker.createGoTo<
    ComponentProps<typeof PageSettingsOther>
  >(
    {
      PageSettingsOther,
    },
    true,
  )
  backToPageSettingsOther = RnStacker.createBackTo<
    ComponentProps<typeof PageSettingsOther>
  >(
    {
      PageSettingsOther,
    },
    true,
  )
  goToPageSettingsCurrentAccount = RnStacker.createGoTo<
    ComponentProps<typeof PageSettingsCurrentAccount>
  >(
    {
      PageSettingsCurrentAccount,
    },
    true,
  )
  backToPageSettingsCurrentAccount = RnStacker.createBackTo<
    ComponentProps<typeof PageSettingsCurrentAccount>
  >(
    {
      PageSettingsCurrentAccount,
    },
    true,
  )
  goToPageCustomPage = RnStacker.createGoTo<
    ComponentProps<typeof PageCustomPage>
  >(
    {
      PageCustomPage,
    },
    true,
  )
  backToPageCustomPage = RnStacker.createBackTo<
    ComponentProps<typeof PageCustomPage>
  >(
    {
      PageCustomPage,
    },
    true,
  )

  // account
  goToPageAccountCreate = RnStacker.createGoTo<
    ComponentProps<typeof PageAccountCreate>
  >({
    PageAccountCreate,
  })
  backToPageAccountCreate = RnStacker.createBackTo<
    ComponentProps<typeof PageAccountCreate>
  >({
    PageAccountCreate,
  })
  goToPageAccountUpdate = RnStacker.createGoTo<
    ComponentProps<typeof PageAccountUpdate>
  >({
    PageAccountUpdate,
  })
  backToPageAccountUpdate = RnStacker.createBackTo<
    ComponentProps<typeof PageAccountUpdate>
  >({
    PageAccountUpdate,
  })
  goToPagePhonebookCreate = RnStacker.createGoTo<
    ComponentProps<typeof PagePhonebookCreate>
  >({
    PagePhonebookCreate,
  })
  backToPagePhonebookCreate = RnStacker.createBackTo<
    ComponentProps<typeof PagePhonebookCreate>
  >({
    PagePhonebookCreate,
  })
  goToPagePhonebookUpdate = RnStacker.createGoTo<
    ComponentProps<typeof PagePhonebookUpdate>
  >({
    PagePhonebookUpdate,
  })
  backToPagePhonebookUpdate = RnStacker.createBackTo<
    ComponentProps<typeof PagePhonebookUpdate>
  >({
    PagePhonebookUpdate,
  })

  // call
  goToPageCallManage = (
    props?: CallStore['inPageCallManage'] & { isOutgoingCall?: boolean },
  ) => {
    // dismiss keyboard automatically to avoid breaking the layout in this screen
    if (RnKeyboard.isKeyboardShowing) {
      Keyboard.dismiss()
    }
    const oc = ctx.call.getOngoingCall()
    const uuid = oc?.callkeepUuid
    if (!props?.isOutgoingCall && uuid && !oc.transferring) {
      // with case kill app not rendered yet and openJavaPnOnVisible not called
      // we should update prevDisplayingCallId here together with onPageCallManage
      ctx.call.prevDisplayingCallId = oc.id
      BrekekeUtils.onPageCallManage(uuid)
    }
    ctx.call.inPageCallManage = {
      isFromCallBar: props?.isFromCallBar,
    }
  }
  backToPageCallManage = (props?: CallStore['inPageCallManage']) => {
    // dismiss keyboard automatically to avoid breaking the layout in this screen
    if (RnKeyboard.isKeyboardShowing) {
      Keyboard.dismiss()
    }
    const oc = ctx.call.getOngoingCall()
    const uuid = oc?.callkeepUuid
    if (uuid && !oc.transferring) {
      BrekekeUtils.onPageCallManage(uuid)
    }
    ctx.call.inPageCallManage = {
      isFromCallBar: props?.isFromCallBar,
    }
    if (RnStacker.stacks.length > 1) {
      RnStacker.dismiss()
    }
  }
  goToPageCallBackgrounds = RnStacker.createGoTo<
    ComponentProps<typeof PageCallBackgrounds>
  >({
    PageCallBackgrounds,
  })
  backToPageCallBackgrounds = RnStacker.createBackTo<
    ComponentProps<typeof PageCallBackgrounds>
  >({
    PageCallBackgrounds,
  })
  goToPageCallTransferChooseUser = RnStacker.createGoTo<
    ComponentProps<typeof PageCallTransferChooseUser>
  >({
    PageCallTransferChooseUser,
  })
  backToPageCallTransferChooseUser = RnStacker.createBackTo<
    ComponentProps<typeof PageCallTransferChooseUser>
  >({
    PageCallTransferChooseUser,
  })
  goToPageCallTransferDial = RnStacker.createGoTo<
    ComponentProps<typeof PageCallTransferDial>
  >({
    PageCallTransferDial,
  })
  backToPageCallTransferDial = RnStacker.createBackTo<
    ComponentProps<typeof PageCallTransferDial>
  >({
    PageCallTransferDial,
  })
  goToPageCallParksOngoing = RnStacker.createGoTo<
    ComponentProps<typeof PageCallParksOngoing>
  >({
    PageCallParksOngoing,
  })
  backToPageCallParksOngoing = RnStacker.createBackTo<
    ComponentProps<typeof PageCallParksOngoing>
  >({
    PageCallParksOngoing,
  })
  goToPageCallDtmfKeypad = RnStacker.createGoTo<
    ComponentProps<typeof PageCallDtmfKeypad>
  >({
    PageCallDtmfKeypad,
  })
  backToPageCallDtmfKeypad = RnStacker.createBackTo<
    ComponentProps<typeof PageCallDtmfKeypad>
  >({
    PageCallDtmfKeypad,
  })

  // chat
  goToPageChatDetail = RnStacker.createGoTo<
    ComponentProps<typeof PageChatDetail>
  >({
    PageChatDetail,
  })
  backToPageChatDetail = RnStacker.createBackTo<
    ComponentProps<typeof PageChatDetail>
  >({
    PageChatDetail,
  })
  goToPageChatGroupCreate = RnStacker.createGoTo<
    ComponentProps<typeof PageChatGroupCreate>
  >({
    PageChatGroupCreate,
  })
  backToPageChatGroupCreate = RnStacker.createBackTo<
    ComponentProps<typeof PageChatGroupCreate>
  >({
    PageChatGroupCreate,
  })
  goToPageChatGroupInvite = RnStacker.createGoTo<
    ComponentProps<typeof PageChatGroupInvite>
  >({
    PageChatGroupInvite,
  })
  backToPageChatGroupInvite = RnStacker.createBackTo<
    ComponentProps<typeof PageChatGroupInvite>
  >({
    PageChatGroupInvite,
  })
  goToPageChatGroupDetail = RnStacker.createGoTo<
    ComponentProps<typeof PageChatGroupDetail>
  >({
    PageChatGroupDetail,
  })
  backToPageChatGroupDetail = RnStacker.createBackTo<
    ComponentProps<typeof PageChatGroupDetail>
  >({
    PageChatGroupDetail,
  })

  // settings
  goToPageSettingsDebug = RnStacker.createGoTo<
    ComponentProps<typeof PageSettingsDebug>
  >({
    PageSettingsDebug,
  })
  backToPageSettingsDebug = RnStacker.createBackTo<
    ComponentProps<typeof PageSettingsDebug>
  >({
    PageSettingsDebug,
  })

  goToPageSettingsDebugFiles = RnStacker.createGoTo<
    ComponentProps<typeof PageSettingsDebugFiles>
  >({
    PageSettingsDebugFiles,
  })
  backToPageSettingsDebugFiles = RnStacker.createBackTo<
    ComponentProps<typeof PageSettingsDebugFiles>
  >({
    PageSettingsDebugFiles,
  })
  // contact
  goToPageContactEdit = RnStacker.createGoTo<
    ComponentProps<typeof PageContactEdit>
  >({
    PageContactEdit,
  })
  backToPageContactEdit = RnStacker.createBackTo<
    ComponentProps<typeof PageContactEdit>
  >(
    {
      PageContactEdit,
    },
    true,
  )
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
    const ca = ctx.auth.getCurrentAccount()
    if (!ca) {
      this.customPageIndex = undefined
      this.goToPageAccountSignIn()
      return
    }
    if (this.customPageIndex) {
      this.customPageIndex()
      this.customPageIndex = undefined
      return
    }
    const arr = menus()
    normalizeSavedNavigation()
    const i = ca.navIndex
    const k = ca.navSubMenus?.[i]
    arr[i].subMenusMap[k].navFn()
  }
}

ctx.nav = new Nav()
