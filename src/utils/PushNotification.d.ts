type PushNotification = {
  register: (initApp: Function) => Promise<void>
  getToken: () => Promise<string>
  getVoipToken: () => Promise<string>
  resetBadgeNumber: () => void
}
export const PushNotification: PushNotification
