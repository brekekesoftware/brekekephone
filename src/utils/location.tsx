import { View } from 'react-native'

import { RnText } from '#/components/RnText'
import { intl } from '#/stores/intl'
import { RnAlert } from '#/stores/RnAlert'
import { BrekekeUtils } from '#/utils/BrekekeUtils'

export const promptEnableGPS = () =>
  new Promise(async resolve => {
    const isEnabled = await BrekekeUtils.isEnableGPS()
    console.log(`[Hoang]:isEnabled ${isEnabled}`)
    if (isEnabled) {
      resolve(true)
      return
    }
    RnAlert.prompt({
      title: intl`Enable Location Services`,
      message: (
        <View>
          <RnText>
            {intl`This app requires Location Services to be enabled for proper functionality. Please enable Location Services in your device settings.`}
          </RnText>
        </View>
      ),
      onConfirm: async () => {
        try {
          const result = await BrekekeUtils.enableGPS()
          resolve(result)
        } catch (e) {
          resolve(false)
        }
      },
      onDismiss: () => resolve(false),
      confirmText: intl`Enable`,
      dismissText: intl`Cancel`,
    })
  })

export const prompBackgroundLocationPermisson = async (): Promise<boolean> =>
  // todo: intl

  new Promise(async resolve => {
    const isEnabled = await BrekekeUtils.isBackgroundLocationGranted()
    console.log(
      `[Hoang]:prompBackgroundLocationPermisson isEnabled ${isEnabled}`,
    )
    if (isEnabled) {
      resolve(true)
      return
    }
    RnAlert.prompt({
      title: intl`Enable Background Location`,
      message: (
        <View>
          <RnText>
            {intl`The app needs background location permission so it can get the wifi SSID for LPC even when you don’t have the app open.`}
          </RnText>
          <RnText>
            {intl`On the next screen, please select “Allow all the time”.`}
          </RnText>
        </View>
      ),
      onConfirm: async () => {
        try {
          const result =
            await BrekekeUtils.requestBackgroundLocationPermissions()
          resolve(result)
        } catch (e) {
          resolve(false)
        }
      },
      onDismiss: () => resolve(false),
      confirmText: intl`Continue`,
      dismissText: intl`Cancel`,
    })
  })

export const prompForegroundLocationPermisson = async (): Promise<boolean> =>
  // todo: intl

  new Promise(async resolve => {
    const isEnabled = await BrekekeUtils.isBackgroundLocationGranted()
    console.log(
      `[Hoang]:prompForegroundLocationPermisson isEnabled ${isEnabled}`,
    )
    if (isEnabled) {
      resolve(true)
      return
    }
    RnAlert.prompt({
      title: intl`Enable Location Permission`,
      message: (
        <View>
          <RnText>{intl`The app needs location permission so it can get the wifi SSID for LPC`}</RnText>
        </View>
      ),
      onConfirm: async () => {
        try {
          const result = await BrekekeUtils.requestLocationPermission()
          console.log(`[Hoang]: Enable Location Permission ${result} `)
          resolve(result)
        } catch (e) {
          resolve(false)
        }
      },
      onDismiss: () => resolve(false),
      confirmText: intl`Continue`,
      dismissText: intl`Cancel`,
    })
  })
