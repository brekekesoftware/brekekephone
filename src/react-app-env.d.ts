/* eslint-disable import/no-default-export */
/// <reference types="react-scripts" />

declare module 'brekekejs/lib/ucclient' {
  const m: unknown
  export default m
}

declare module 'jssip' {
  const m: unknown
  export default m
}

declare module 'react-native-voip-push-notification' {
  const m: {
    presentLocalNotification: Function
    addEventListener: Function
    registerVoipToken: Function
    requestPermissions: Function
    RNVoipPushRemoteNotificationsRegisteredEvent: string
    RNVoipPushRemoteNotificationReceivedEvent: string
  }
  export default m
}

declare module 'validatorjs/src/lang/en' {
  const en: { [k: string]: string }
  export default en
}

declare module 'handlebars/dist/handlebars' {
  // eslint-disable-next-line import/no-duplicates
  import m from 'handlebars'

  export default m
}

declare module 'helper-moment' {
  // eslint-disable-next-line import/no-duplicates
  import h from 'handlebars'

  const m: h.HelperDelegate
  export default m
}

declare module '*.mp3' {
  const src: string
  export default src
}
