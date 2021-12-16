import 'brekekejs/lib/jsonrpc'
import 'brekekejs/lib/pal'

import EventEmitter from 'eventemitter3'

import { waitPbx } from '../stores/authStore'
import { Profile, profileStore } from '../stores/profileStore'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { Pbx, PbxGetProductInfoRes } from './brekekejs'

export class PBX extends EventEmitter {
  client?: Pbx
  private connectTimeoutId = 0

  connect = async (p: Profile) => {
    console.error('PBX PN debug: call pbx.connect')
    if (this.client) {
      // return Promise.reject(new Error('PAL client is connected'))
      // TODO
      return
    }

    this.pbxConfig = undefined

    const d = profileStore.getProfileData(p)
    const wsUri = `wss://${p.pbxHostname}:${p.pbxPort}/pbx/ws`
    const client = window.Brekeke.pbx.getPal(wsUri, {
      tenant: p.pbxTenant,
      login_user: p.pbxUsername,
      login_password: p.pbxPassword,
      _wn: d.accessToken,
      park: p.parks,
      voicemail: 'self',
      user: '*',
      status: true,
      secure_login_password: false,
      phonetype: 'webphone',
    })
    this.client = client
    console.error('PBX PN debug: construct pbx.client')

    client._pal = ((method: keyof Pbx, params?: object) => {
      return new Promise((resolve, reject) => {
        const f = (client[method] as Function).bind(client) as Function
        if (typeof f !== 'function') {
          return reject(new Error(`PAL client doesn't support "${method}"`))
        }
        f(params, resolve, reject)
      })
    }) as unknown as Pbx['_pal']

    client.debugLevel = 2

    await Promise.race([
      new Promise((_, reject) => {
        this.connectTimeoutId = BackgroundTimer.setTimeout(() => {
          client.close()
          // Fix case already reconnected
          if (client === this.client) {
            reject(new Error('Timeout'))
          }
        }, 10000)
      }),
      new Promise((resolve, reject) => {
        client.login(() => resolve(undefined), reject)
      }),
    ])

    this.clearConnectTimeoutId()

    client.onClose = () => {
      this.emit('connection-stopped')
    }

    client.onError = err => {
      console.error('pbx.client.onError:', err)
    }

    client.notify_serverstatus = e => {
      if (e?.status === 'active') {
        return this.emit('connection-started')
      }
      if (e?.status === 'inactive') {
        return this.emit('connection-stopped')
      }
      return
    }

    // {"room_id":"282000000230","talker_id":"1416","time":1587451427817,"park":"777","status":"on"}
    // {"time":1587451575120,"park":"777","status":"off"}
    client.notify_park = e => {
      // TODO
      if (e?.status === 'on') {
        return this.emit('park-started', e.park)
      }
      if (e?.status === 'off') {
        return this.emit('park-stopped', e.park)
      }
      return
    }

    client.notify_voicemail = e => {
      if (!e) {
        return
      }
      this.emit('voicemail-updated', e)
    }

    client.notify_status = e => {
      if (!e) {
        return
      }
      switch (e.status) {
        case '14':
        case '2':
        case '36':
          return this.emit('user-talking', {
            user: e.user,
            talker: e.talker_id,
          })
        case '35':
          return this.emit('user-holding', {
            user: e.user,
            talker: e.talker_id,
          })
        case '-1':
          return this.emit('user-hanging', {
            user: e.user,
            talker: e.talker_id,
          })
        case '1':
          return this.emit('user-calling', {
            user: e.user,
            talker: e.talker_id,
          })
        case '65':
          return this.emit('user-ringing', {
            user: e.user,
            talker: e.talker_id,
          })
        default:
          return
      }
    }
  }

  disconnect = () => {
    if (this.client) {
      this.client.close()
      this.client = undefined
      console.error('PBX PN debug: pbx.client set to null')
    }
    this.clearConnectTimeoutId()
  }
  private clearConnectTimeoutId = () => {
    if (this.connectTimeoutId) {
      BackgroundTimer.clearTimeout(this.connectTimeoutId)
      this.connectTimeoutId = 0
    }
  }

  private pbxConfig?: PbxGetProductInfoRes
  getConfig = async () => {
    if (!this.pbxConfig) {
      await waitPbx()
      if (!this.client) {
        return
      }
      this.pbxConfig = await this.client._pal('getProductInfo', {
        webphone: 'true',
      })
    }
    return this.pbxConfig
  }

  createSIPAccessToken = async (sipUsername: string) => {
    await waitPbx()
    if (!this.client) {
      return
    }
    return this.client._pal('createAuthHeader', {
      username: sipUsername,
    })
  }

  getUsers = async (tenant: string) => {
    await waitPbx()
    if (!this.client) {
      return
    }
    return this.client._pal('getExtensions', {
      tenant,
      pattern: '..*',
      limit: -1,
      type: 'user',
    })
  }

  getOtherUsers = async (tenant: string, userIds: string | string[]) => {
    await waitPbx()
    if (!this.client) {
      return
    }

    const res = await this.client._pal('getExtensionProperties', {
      tenant,
      extension: userIds,
      property_names: ['name'],
    })

    const users = new Array(res.length)

    for (let i = 0; i < res.length; i++) {
      const srcUser = res[i]

      const dstUser = {
        id: userIds[i],
        name: srcUser[0],
      }

      users[i] = dstUser
    }

    return users
  }

  getUserForSelf = async (tenant: string, userId: string) => {
    await waitPbx()
    if (!this.client) {
      return
    }

    const res = await this.client._pal('getExtensionProperties', {
      tenant,
      extension: userId,

      property_names: [
        'name',
        'p1_ptype',
        'p2_ptype',
        'p3_ptype',
        'p4_ptype',
        'pnumber',
        'language',
      ],
    })

    const pnumber = ('' + res[5]).split(',')

    const phones = [
      {
        id: pnumber[0],
        type: res[1] as string,
      },
      {
        id: pnumber[1],
        type: res[2] as string,
      },
      {
        id: pnumber[2],
        type: res[3] as string,
      },
      {
        id: pnumber[3],
        type: res[4] as string,
      },
    ]

    const lang = res[6]
    const userName = res[0]

    return {
      id: userId,
      name: userName as string,
      phones,
      language: lang as string,
    }
  }

  getContacts = async ({
    search_text,
    shared,
    offset,
    limit,
  }: {
    search_text: string
    shared: boolean
    offset: number
    limit: number
  }) => {
    await waitPbx()
    if (!this.client) {
      return
    }
    const params = {
      phonebook: '',
      search_text,
      shared,
      offset,
      limit,
    }

    const res = await this.client._pal('getContactList', params)

    return res.map(contact => ({
      id: contact.aid,
      name: contact.display_name,
      phonebook: contact.phonebook,
      user: contact.user,
    }))
  }

  getContact = async (id: string) => {
    await waitPbx()
    if (!this.client) {
      return
    }

    const res = await this.client._pal('getContact', {
      aid: id,
    })
    res.info = res.info || {}

    return {
      id,
      firstName: res.info.$firstname,
      lastName: res.info.$lastname,
      workNumber: res.info.$tel_work,
      homeNumber: res.info.$tel_home,
      cellNumber: res.info.$tel_mobile,
      address: res.info.$address,
      company: res.info.$company,
      email: res.info.$email,
      job: res.info.$title,
      book: res.phonebook,
      hidden: res.info.$hidden,
      shared: res.shared === 'true',
    }
  }

  setContact = async (contact: {
    id: string
    book: string
    shared: boolean
    firstName: string
    lastName: string
    workNumber: string
    homeNumber: string
    cellNumber: string
    address: string
    job: string
    email: string
    company: string
    hidden: boolean
  }) => {
    await waitPbx()
    if (!this.client) {
      return
    }
    return this.client._pal('setContact', {
      aid: contact.id,
      phonebook: contact.book,
      shared: contact.shared ? 'true' : 'false',

      info: {
        $firstname: contact.firstName,
        $lastname: contact.lastName,
        $tel_work: contact.workNumber,
        $tel_home: contact.homeNumber,
        $tel_mobile: contact.cellNumber,
        $address: contact.address,
        $title: contact.job,
        $email: contact.email,
        $company: contact.company,
        $hidden: contact.hidden ? 'true' : 'false',
      },
    })
  }

  holdTalker = async (tenant: string, talker: string) => {
    await waitPbx()
    if (!this.client) {
      return false
    }
    await this.client._pal('hold', {
      tenant,
      tid: talker,
    })
    return true
  }

  unholdTalker = async (tenant: string, talker: string) => {
    await waitPbx()
    if (!this.client) {
      return false
    }
    await this.client._pal('unhold', {
      tenant,
      tid: talker,
    })
    return true
  }

  startRecordingTalker = async (tenant: string, talker: string) => {
    await waitPbx()
    if (!this.client) {
      return false
    }
    await this.client._pal('startRecording', {
      tenant,
      tid: talker,
    })
    return true
  }

  stopRecordingTalker = async (tenant: string, talker: string) => {
    await waitPbx()
    if (!this.client) {
      return false
    }
    await this.client._pal('stopRecording', {
      tenant,
      tid: talker,
    })
    return true
  }

  transferTalkerBlind = async (
    tenant: string,
    talker: string,
    toUser: string,
  ) => {
    await waitPbx()
    if (!this.client) {
      return false
    }
    await this.client._pal('transfer', {
      tenant,
      user: toUser,
      tid: talker,
      mode: 'blind',
    })
    return true
  }

  transferTalkerAttended = async (
    tenant: string,
    talker: string,
    toUser: string,
  ) => {
    await waitPbx()
    if (!this.client) {
      return false
    }
    await this.client._pal('transfer', {
      tenant,
      user: toUser,
      tid: talker,
    })
    return true
  }

  joinTalkerTransfer = async (tenant: string, talker: string) => {
    await waitPbx()
    if (!this.client) {
      return false
    }
    await this.client._pal('conference', {
      tenant,
      tid: talker,
    })
    return true
  }

  stopTalkerTransfer = async (tenant: string, talker: string) => {
    await waitPbx()
    if (!this.client) {
      return false
    }
    await this.client._pal('cancelTransfer', {
      tenant,
      tid: talker,
    })
    return true
  }

  parkTalker = async (tenant: string, talker: string, atNumber: string) => {
    await waitPbx()
    if (!this.client) {
      return false
    }
    await this.client._pal('park', {
      tenant,
      tid: talker,
      number: atNumber,
    })
    return true
  }

  sendDTMF = async (signal: string, tenant: string, talker_id: string) => {
    await waitPbx()
    if (!this.client) {
      return false
    }
    await this.client._pal('sendDTMF', {
      signal,
      tenant,
      talker_id,
    })
    return true
  }

  setApnsToken = async ({
    device_id,
    username,
    voip = false,
  }: {
    device_id: string
    username: string
    voip?: boolean
  }) => {
    await waitPbx()
    if (!this.client) {
      return false
    }
    await this.client._pal('pnmanage', {
      command: 'set',
      service_id: '11',
      application_id: 'com.brekeke.phonedev' + (voip ? '.voip' : ''),
      user_agent: 'react-native',
      username: username + (voip ? '@voip' : ''),
      device_id,
    })
    return true
  }

  setFcmPnToken = async ({
    device_id,
    username,
    voip = false,
  }: {
    device_id: string
    username: string
    voip?: boolean
  }) => {
    await waitPbx()
    if (!this.client) {
      return false
    }
    await this.client._pal('pnmanage', {
      command: 'set',
      service_id: '12',
      application_id: '22177122297',
      user_agent: 'react-native',
      username: username + (voip ? '@voip' : ''),
      device_id,
    })
    return true
  }

  removeApnsToken = async ({
    device_id,
    username,
    voip = false,
  }: {
    device_id: string
    username: string
    voip?: boolean
  }) => {
    await waitPbx()
    if (!this.client) {
      return false
    }
    await this.client._pal('pnmanage', {
      command: 'remove',
      service_id: '11',
      application_id: 'com.brekeke.phonedev' + (voip ? '.voip' : ''),
      user_agent: 'react-native',
      username: username + (voip ? '@voip' : ''),
      device_id,
    })
    return true
  }

  removeFcmPnToken = async ({
    device_id,
    username,
    voip = false,
  }: {
    device_id: string
    username: string
    voip?: boolean
  }) => {
    await waitPbx()
    if (!this.client) {
      return false
    }
    await this.client._pal('pnmanage', {
      command: 'remove',
      service_id: '12',
      application_id: '22177122297',
      user_agent: 'react-native',
      username: username + (voip ? '@voip' : ''),
      device_id,
    })
    return true
  }

  addWebPnToken = async ({
    auth_secret,
    endpoint,
    key,
    username,
  }: {
    auth_secret: string
    endpoint: string
    username: string
    key: string
  }) => {
    await waitPbx()
    if (!this.client) {
      return false
    }
    await this.client
      ._pal('pnmanage', {
        command: 'set',
        service_id: '13',
        application_id: '22177122297',
        user_agent: navigator.userAgent,
        username,
        endpoint,
        auth_secret,
        key,
      })
      .catch((err: Error) => {
        console.error('addWebPnToken:', err)
      })
    return true
  }
}

export const pbx = new PBX()
