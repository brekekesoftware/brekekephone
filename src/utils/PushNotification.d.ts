export const PushNotification: {
  register: (initApp: Function) => Promise<void>
  getToken: () => Promise<string>
  getVoipToken: () => Promise<string>
  resetBadgeNumber: () => void
} = {}
