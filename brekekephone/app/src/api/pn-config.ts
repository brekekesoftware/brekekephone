export type PnParams = {
  // common
  device_id: string
  username: string
  voip?: boolean
  // for web browser
  auth_secret?: string
  endpoint?: string
  key?: string
}
export type PnParamsNew = PnParams & {
  // new pnmanage in pbx 3.15 which can compose multile services
  command: PnCommand
  service_id: PnServiceId | PnServiceId[]
  pnmanageNew?: boolean
  device_id_voip?: string
}
export enum PnCommand {
  set = 'set',
  remove = 'remove',
}
export enum PnServiceId {
  lpc = '4',
  apns = '11',
  fcm = '12',
  web = '13',
}
