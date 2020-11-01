import 'brekekejs/lib/jsonrpc'
import 'brekekejs/lib/pal'

import EventEmitter from 'eventemitter3'

import profileStore, { Profile } from '../global/profileStore'
import { Pbx } from './brekekejs'

class PBX extends EventEmitter {
  client = (null as unknown) as Pbx

  async connect(p: Profile) {
    if (this.client) {
      return Promise.reject(new Error('PAL client is connected'))
    }

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

    client.pal = (((method: keyof typeof client, params?: object) => {
      return new Promise((onres, onerr) => {
        const f = (client[method] as Function).bind(client) as Function
        if (typeof f !== 'function') {
          return onerr(new Error(`PAL client doesn't support "${method}"`))
        }
        f(params, onres, onerr)
      })
    }) as unknown) as Pbx['pal']

    client.debugLevel = 2
    let timeout = 0

    await Promise.race([
      new Promise((_, onerr) => {
        timeout = window.setTimeout(() => {
          client.close()
          onerr(new Error('Timeout'))
        }, 10000)
      }),
      new Promise((onres, onerr) => {
        client.login(onres, onerr)
      }),
    ])

    clearTimeout(timeout)
    this.client = client

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
    return
  }

  disconnect() {
    if (this.client) {
      this.client.close()
      this.client = (null as unknown) as Pbx
    }
  }

  getConfig() {
    return this.client.pal('getProductInfo', null)
  }

  createSIPAccessToken(sipUsername: string) {
    return this.client.pal('createAuthHeader', {
      username: sipUsername,
    })
  }

  getUsers(tenant: string) {
    return this.client.pal('getExtensions', {
      tenant,
      pattern: '..*',
      limit: -1,
      type: 'user',
    })
  }

  async getOtherUsers(tenant: string, userIds: string | string[]) {
    const res = await this.client.pal('getExtensionProperties', {
      tenant: tenant,
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

  async getUserForSelf(tenant: string, userId: string) {
    const res = await this.client.pal('getExtensionProperties', {
      tenant: tenant,
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
        type: res[1],
      },
      {
        id: pnumber[1],
        type: res[2],
      },
      {
        id: pnumber[2],
        type: res[3],
      },
      {
        id: pnumber[3],
        type: res[4],
      },
    ]

    const lang = res[6]
    const userName = res[0]

    return {
      id: userId,
      name: userName,
      phones,
      language: lang,
    }
  }

  // async getPhonebooks() {
  //   const res = await this.client.pal('getPhonebooks')

  //   return res.map(item => ({
  //     name: item.phonebook,
  //     shared: item.shared === 'true',
  //   }))
  // }

  async getContacts({
    shared,
    offset,
    limit,
  }: {
    shared: boolean
    offset: number
    limit: number
  }) {
    const res = await this.client.pal('getContactList', {
      shared: shared === true ? 'true' : 'false',
      offset,
      limit,
    })

    return res.map(contact => ({
      id: contact.aid,
      name: contact.display_name,
    }))
  }

  async getContact(id: string) {
    const res = await this.client.pal('getContact', {
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

  setContact(contact: {
    id: string
    book: string
    shared: string
    firstName: string
    lastName: string
    workNumber: string
    homeNumber: string
    cellNumber: string
    address: string
    job: string
    email: string
    company: string
    hidden: string
  }) {
    return this.client.pal('setContact', {
      aid: contact.id,
      phonebook: contact.book,
      shared: contact.shared,

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
        $hidden: contact.hidden,
      },
    })
  }

  holdTalker(tenant: string, talker: string) {
    return this.client.pal('hold', {
      tenant,
      tid: talker,
    })
  }

  unholdTalker(tenant: string, talker: string) {
    return this.client.pal('unhold', {
      tenant,
      tid: talker,
    })
  }

  startRecordingTalker(tenant: string, talker: string) {
    return this.client.pal('startRecording', {
      tenant,
      tid: talker,
    })
  }

  stopRecordingTalker(tenant: string, talker: string) {
    return this.client.pal('stopRecording', {
      tenant,
      tid: talker,
    })
  }

  transferTalkerBlind(tenant: string, talker: string, toUser: string) {
    return this.client.pal('transfer', {
      tenant,
      user: toUser,
      tid: talker,
      mode: 'blind',
    })
  }

  transferTalkerAttended(tenant: string, talker: string, toUser: string) {
    return this.client.pal('transfer', {
      tenant,
      user: toUser,
      tid: talker,
    })
  }

  joinTalkerTransfer(tenant: string, talker: string) {
    return this.client.pal('conference', {
      tenant,
      tid: talker,
    })
  }

  stopTalkerTransfer(tenant: string, talker: string) {
    return this.client.pal('cancelTransfer', {
      tenant,
      tid: talker,
    })
  }

  parkTalker(tenant: string, talker: string, atNumber: string) {
    return this.client.pal('park', {
      tenant,
      tid: talker,
      number: atNumber,
    })
  }

  addApnsToken = ({
    device_id,
    username,
    voip = false,
  }: {
    device_id: string
    username: string
    voip?: boolean
  }) =>
    new Promise((resolve, reject) => {
      const params = {
        command: 'set',
        service_id: '11',
        application_id: 'com.brekeke.phonedev' + (voip ? '.voip' : ''),
        user_agent: 'react-native',
        username: username + (voip ? '@voip' : ''),
        device_id,
      }
      if (!this.client) {
        resolve(null)
      }
      this.client.pal('pnmanage', params).then(resolve).catch(reject)
    }).catch((err: Error) => {
      console.error('addApnsToken:' + (voip ? ' voip:' : ''), err)
    })

  addFcmPnToken = ({
    device_id,
    username,
    voip = false,
  }: {
    device_id: string
    username: string
    voip?: boolean
  }) =>
    new Promise((resolve, reject) => {
      const params = {
        command: 'set',
        service_id: '12',
        application_id: '22177122297',
        user_agent: 'react-native',
        username: username + (voip ? '@voip' : ''),
        device_id,
      }
      if (!this.client) {
        resolve(null)
      }
      this.client.pal('pnmanage', params).then(resolve).catch(reject)
    }).catch((err: Error) => {
      console.error('addFcmPnToken:' + (voip ? ' voip:' : ''), err)
    })

  addWebPnToken = ({
    auth_secret,
    endpoint,
    key,
    username,
  }: {
    auth_secret: string
    endpoint: string
    username: string
    key: string
  }) =>
    new Promise((resolve, reject) => {
      const params = {
        command: 'set',
        service_id: '13',
        application_id: '22177122297',
        user_agent: navigator.userAgent,
        username,
        endpoint,
        auth_secret,
        key,
      }
      if (!this.client) {
        resolve(null)
      }
      this.client.pal('pnmanage', params).then(resolve).catch(reject)
    }).catch((err: Error) => {
      console.error('addWebPnToken:', err)
    })
}

export default new PBX()
