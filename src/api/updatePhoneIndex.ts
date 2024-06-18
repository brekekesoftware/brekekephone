import { Platform } from 'react-native'

import { accountStore } from '../stores/accountStore'
import { getAuthStore } from '../stores/authStore'
import { intl, intlDebug } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { RnAlert } from '../stores/RnAlert'
import { RnStacker } from '../stores/RnStacker'
import { openLinkSafely, urls } from '../utils/deeplink'
import { PushNotification } from '../utils/PushNotification'
import { pbx } from './pbx'

export const updatePhoneIndex = async (
  p = getAuthStore().getCurrentAccount(),
  api = pbx,
): Promise<null | {
  id: string
  type: string
}> => {
  if (!p) {
    return null
  }
  //
  const phoneIndex = parseInt(p.pbxPhoneIndex) || 4
  const extProps = await api.getPbxPropertiesForCurrentUser(
    p.pbxTenant,
    p.pbxUsername,
  )
  if (!extProps) {
    console.error('updatePhoneIndex.setExtensionProperties: extProps undefined')
    return null
  }

  const as = getAuthStore()

  // update current account data phoneappli.enable
  if (p.id === as.getCurrentAccount()?.id) {
    as.userExtensionProperties = extProps
    const d = await as.getCurrentDataAsync()
    const paEnabled = extProps.phoneappli
    if (d) {
      d.phoneappliEnabled = paEnabled
      accountStore.updateAccountData(d)
    }
    // Open Phone Appli app when phoneappli.enable is true and on PageCallRecents
    const s = RnStacker.stacks[RnStacker.stacks.length - 1]
    if (paEnabled && s.name === 'PageCallRecents') {
      Nav().customPageIndex = Nav().goToPageCallKeypad
      Nav().goToPageCallKeypad()
      if (Platform.OS === 'ios') {
        PushNotification.resetBadgeNumber()
      }
      openLinkSafely(urls.phoneappli.HISTORY_CALLED)
    }
  }

  const phone = extProps.phones[phoneIndex - 1]
  const phoneTypeCorrect = phone.type === 'Web Phone'
  const { pbxTenant, pbxUsername } = p
  const expectedPhoneId = `${pbxTenant}_${pbxUsername}_phone${phoneIndex}_webphone`
  const phoneIdCorrect = phone.id === expectedPhoneId
  const setExtensionProperties = async () => {
    if (!api.client) {
      console.error(
        'updatePhoneIndex.setExtensionProperties: api.client undefined',
      )
      return
    }
    await api.client.call_pal('setExtensionProperties', {
      tenant: pbxTenant,
      extension: pbxUsername,
      properties: {
        // see ./pbx getExtensionProperties for the detail of parameters
        pnumber: extProps.phones.map(({ id }) => id).join(','),
        [`p${phoneIndex}_ptype`]: phone.type,
      },
    })
  }

  if (phoneTypeCorrect && phoneIdCorrect) {
    // do nothing
  } else if (phoneTypeCorrect && !phoneIdCorrect) {
    phone.id = expectedPhoneId
    await setExtensionProperties()
  } else if (!phoneTypeCorrect && !phoneIdCorrect) {
    phone.id = expectedPhoneId
    phone.type = 'Web Phone'
    await setExtensionProperties()
  } else {
    return new Promise(resolve => {
      RnAlert.prompt({
        title: intl`Warning`,
        message: intl`This phone index is already in use. Do you want to continue?`,
        onConfirm: () => {
          phone.type = 'Web Phone'
          setExtensionProperties()
            .then(() => {
              resolve(phone)
            })
            .catch((err: Error) => {
              RnAlert.error({
                message: intlDebug`Failed to set extension properties`,
                err,
              })
              resolve(null)
            })
        },
        onDismiss: () => {
          Nav().goToPageAccountSignIn()
          resolve(null)
        },
      })
    })
  }
  return phone
}
