import { getAuthStore } from '../stores/authStore'
import intl, { intlDebug } from '../stores/intl'
import Nav from '../stores/Nav'
import RnAlert from '../stores/RnAlert'
import pbx from './pbx'

const updatePhoneIndex = () =>
  updatePhoneIndexWithoutCatch().catch((err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to update phone index`,
      err,
    })
    Nav().goToPageProfileSignIn()
    return null
  })

export const updatePhoneIndexWithoutCatch = async (
  p = getAuthStore().currentProfile,
  api = pbx,
): Promise<null | {
  id: string
  type: string
}> => {
  //
  const phoneIndex = parseInt(p.pbxPhoneIndex) || 4
  const extProps = await api.getUserForSelf(p.pbxTenant, p.pbxUsername)
  if (!extProps) {
    return null
  }
  const phone = extProps.phones[phoneIndex - 1]
  const phoneTypeCorrect = phone.type === 'Web Phone'
  const { pbxTenant, pbxUsername } = p
  const expectedPhoneId = `${pbxTenant}_${pbxUsername}_phone${phoneIndex}_webphone`
  const phoneIdCorrect = phone.id === expectedPhoneId
  //
  const setExtensionProperties = async () => {
    if (!extProps) {
      return
    }
    await api.client._pal('setExtensionProperties', {
      tenant: pbxTenant,
      extension: pbxUsername,
      properties: {
        // See ./pbx getExtensionProperties for the detail of parameters
        pnumber: extProps.phones.map((p: { id: string }) => p.id).join(','),
        [`p${phoneIndex}_ptype`]: phone.type,
      },
    })
    if (p === getAuthStore().currentProfile) {
      getAuthStore().userExtensionProperties = extProps
    }
  }
  //
  if (phoneTypeCorrect && phoneIdCorrect) {
    // Do nothing
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
          Nav().goToPageProfileSignIn()
          resolve(null)
        },
      })
    })
  }
  return phone
}

export default updatePhoneIndex
