import { Platform } from 'react-native'

import { callStore } from '../stores/callStore'
import { Nav } from '../stores/Nav'
import { BrekekeUtils } from './RnNativeModules'

export const onBackToCallManageScreen = (uuid?: string) => {
  const c = callStore.getCurrentCall()
  if (Platform.OS === 'android') {
    console.log(
      'dev:::',
      'onBackToCallManageScreen::name::' + c?.getDisplayName(),
    )
    console.log('dev:::', 'onBackToCallManageScreen::UUID::' + c?.callkeepUuid)
    console.log('dev:::', 'onBackToCallManageScreen::incoming::' + c?.incoming)
    c?.incoming &&
      c?.callkeepUuid &&
      BrekekeUtils.onStartIncomingActivity(c.callkeepUuid)
  } else {
    Nav().backToPageCallManage()
  }
}
