import { isIos } from '#/config'
import { ctx } from '#/stores/ctx'
import { intl, intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/RnAlert'
import { RnStacker } from '#/stores/RnStacker'
import { openLinkSafely, urls } from '#/utils/deeplink'
import { PushNotification } from '#/utils/PushNotification'

export const updatePhoneAppli = async () => {
  const p = ctx.auth.getCurrentAccount()
  if (!p) {
    return
  }

  const extProps = await ctx.pbx.getPbxPropertiesForCurrentUser(
    p.pbxTenant,
    p.pbxUsername,
  )

  if (!extProps) {
    console.error('updatePhoneAppli.setExtensionProperties: extProps undefined')
    return
  }

  handlePhoneAppli(extProps)
}
export const handlePhoneAppli = async extProps => {
  if (!extProps) {
    console.error('handlePhoneAppli.setExtensionProperties: extProps undefined')
    return
  }

  ctx.auth.userExtensionProperties = extProps
  const d = await ctx.auth.getCurrentDataAsync()
  const paEnabled = extProps.phoneappli
  if (d) {
    d.phoneappliEnabled = paEnabled
    ctx.account.updateAccountData(d)
  }

  // open PhoneAppli app when phoneappli.enable is true and on PageCallRecents
  const s = RnStacker.stacks[RnStacker.stacks.length - 1]
  if (paEnabled && s.name === 'PageCallRecents') {
    ctx.nav.customPageIndex = ctx.nav.goToPageCallKeypad
    ctx.nav.goToPageCallKeypad()
    if (isIos) {
      PushNotification.resetBadgeNumber()
    }
    openLinkSafely(urls.phoneappli.HISTORY_CALLED)
  }
}

export const updatePhoneIndex = async (
  p = ctx.auth.getCurrentAccount(),
  api = ctx.pbx,
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

  // update current account data phoneappli.enable
  if (p.id === ctx.auth.getCurrentAccount()?.id) {
    handlePhoneAppli(extProps)
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
              resolve(null)
            })
        },
        onDismiss: () => {
          ctx.nav.goToPageAccountSignIn()
          resolve(null)
        },
      })
    })
  }
  return phone
}
