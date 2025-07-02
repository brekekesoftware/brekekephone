import { NativeModules } from 'react-native'

const { RingtoneModule } = NativeModules

export const {
  getRingtoneList,
  setRingtoneForAccount,
  removeRingtoneForAccount,
} = RingtoneModule
