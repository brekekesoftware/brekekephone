import 'brekekejs/lib/jsonrpc'

import UCClient0 from 'brekekejs/lib/ucclient'
import EventEmitter from 'eventemitter3'
import { Platform } from 'react-native'

import { Profile } from '../stores/profileStore'
import {
  UcChatClient,
  UcConference,
  UcConstants,
  UcListeners,
  UcLogger,
  UcReceieveUnreadText,
  UcSearchTexts,
  UcSendFile,
  UcSendFiles,
  UcWebchatConferenceText,
} from './brekekejs'

const { ChatClient, Logger, Constants } = UCClient0 as {
  ChatClient: UcChatClient
  Logger: UcLogger
  Constants: UcConstants
}

export { ChatClient, Constants, Logger }

const codeMapUserStatus = {
  0: 'offline',
  1: 'online',
  2: 'idle',
  3: 'busy',
}
const getUserStatusFromCode = (code: number) =>
  codeMapUserStatus[code as keyof typeof codeMapUserStatus] ||
  codeMapUserStatus['0']

const codeMapFileState = {
  0: 'waiting',
  1: 'waiting',
  2: 'started',
  3: 'success',
  4: 'stopped',
  5: 'stopped',
  6: 'failure',
}
const getFileStateFromCode = (code: number) =>
  codeMapFileState[code as keyof typeof codeMapFileState] ||
  codeMapFileState['0']

export class UC extends EventEmitter {
  client: UcChatClient
  constructor() {
    super()
    const logger = new Logger('all')
    this.client = new ChatClient(logger)

    this.client.setEventListeners({
      forcedSignOut: this.onConnectionStopped,
      buddyStatusChanged: this.onUserUpdated,
      receivedTyping: undefined,
      receivedText: this.onTextReceived,
      fileReceived: this.onFileReceived,
      fileInfoChanged: this.onFileProgress,
      fileTerminated: this.onFileFinished,
      invitedToConference: this.onGroupInvited,
      conferenceMemberChanged: this.onGroupUpdated,
    })
  }

  onConnectionStopped: UcListeners['forcedSignOut'] = ev => {
    this.emit('connection-stopped', ev)
  }

  onUserUpdated: UcListeners['buddyStatusChanged'] = ev => {
    if (!ev) {
      return
    }

    this.emit('user-updated', {
      id: ev.user_id,
      name: ev.name,
      avatar: ev.profile_image_url,
      status: getUserStatusFromCode(ev.status),
      statusText: ev.display,
    })
  }

  onTextReceived: UcListeners['receivedText'] = ev => {
    if (!ev || !ev.sender) {
      return
    }
    // handle update message on list webchat
    // this.emit('received-webchat-text', {
    //   conf_id: ev.conf_id,
    //   text: ev.text,
    // })

    ev.conf_id
      ? this.emit('group-chat-created', {
          id: ev.received_text_id,
          group: ev.conf_id,
          text: ev.text,
          creator: ev.sender.user_id,
          created: ev.sent_ltime,
          conf_id: ev.conf_id,
        })
      : this.emit('buddy-chat-created', {
          id: ev.received_text_id,
          text: ev.text,
          creator: ev.sender.user_id,
          created: ev.sent_ltime,
        })
  }

  onFileReceived: UcListeners['fileReceived'] = ev => {
    if (!ev || !ev.fileInfo) {
      return
    }

    const file = {
      id: ev.fileInfo.file_id,
      name: ev.fileInfo.name,
      size: ev.fileInfo.size,
      incoming: true,
      state: getFileStateFromCode(ev.fileInfo.status),
      transferPercent: ev.fileInfo.progress,
    }

    this.emit('file-received', file)

    ev.conf_id
      ? this.emit('group-chat-created', {
          id: ev.text_id,
          creator: ev.fileInfo.target.user_id,
          group: ev.conf_id,
          file: file.id,
          created: ev.sent_ltime,
        })
      : this.emit('buddy-chat-created', {
          id: ev.text_id,
          creator: ev.fileInfo.target.user_id,
          file: file.id,
          created: ev.sent_ltime,
        })
  }

  onFileProgress: UcListeners['fileInfoChanged'] = ev => {
    if (!ev || !ev.fileInfo) {
      return
    }

    this.emit('file-progress', {
      id: ev.fileInfo.file_id,
      state: getFileStateFromCode(ev.fileInfo.status),
      transferPercent: ev.fileInfo.progress,
    })
  }

  onFileFinished: UcListeners['fileTerminated'] = ev => {
    if (!ev || !ev.fileInfo) {
      return
    }

    this.emit('file-finished', {
      id: ev.fileInfo.file_id,
      state: getFileStateFromCode(ev.fileInfo.status),
      transferPercent: ev.fileInfo.progress,
    })
  }

  onGroupInvited: UcListeners['invitedToConference'] = ev => {
    if (!ev || !ev.conference) {
      return
    }
    // webchat: invited from guest
    const isWebchat = ev.conference.invite_properties?.webchatfromguest
    this.emit('chat-group-invited', {
      id: ev.conference.conf_id,
      name: ev.conference.subject || ev.conference.creator.user_name || '',
      inviter: ev.conference.from.user_id,
      members: ev.conference.user || [],
      webchat: isWebchat ? ev.conference : null,
    })
  }

  onGroupUpdated: UcListeners['conferenceMemberChanged'] = ev => {
    if (!ev || !ev.conference) {
      return
    }
    // webchat: update webchat
    const isWebchat = ev.conference.invite_properties?.webchatfromguest
    if (ev.conference.conf_status === 0) {
      // logic if webchat user will be close via button
      if (isWebchat) {
        this.emit('chat-group-updated', {
          id: ev.conference.conf_id,
          name: ev.conference.subject || ev.conference.creator.user_name || '',
          jointed: false,
          webchat: isWebchat ? ev.conference : null,
        })
      } else {
        this.emit('chat-group-revoked', {
          id: ev.conference.conf_id,
        })
      }
      return
    }

    this.emit('chat-group-updated', {
      id: ev.conference.conf_id,
      name: ev.conference.subject || ev.conference.creator.user_name || '',
      jointed: ev.conference.conf_status === 2,
      members: (ev.conference.user || [])
        .filter(user => user.conf_status === 2)
        .map(user => user.user_id),
      webchat: isWebchat ? ev.conference : null,
    })
  }

  connect = (profile: Profile, ucHost: string) => {
    if (ucHost.indexOf(':') < 0) {
      ucHost += ':443'
    }
    const ucScheme = ucHost.endsWith(':80') ? 'http' : 'https'
    return new Promise((resolve, reject) =>
      this.client.signIn(
        `${ucScheme}://${ucHost}`,
        'uc',
        profile.pbxTenant,
        profile.pbxUsername,
        profile.pbxPassword,
        undefined,
        () => resolve(undefined),
        reject,
      ),
    )
  }

  disconnect = () => {
    this.client.signOut()
  }

  me = () => {
    const profile = this.client.getProfile() || {}
    const status = this.client.getStatus() || {}

    return {
      id: profile.user_id,
      name: profile.name,
      avatar: profile.profile_image_url,
      status: getUserStatusFromCode(status.status),
      statusText: status.display,
    }
  }

  setStatus = (status: string, statusText: string) => {
    let num_status = '0'
    if (status === 'online') {
      num_status = '1'
    }
    if (status === 'busy') {
      num_status = '3'
    }
    return new Promise((resolve, reject) =>
      this.client.changeStatus(
        num_status,
        statusText,
        () => resolve(undefined),
        reject,
      ),
    )
  }

  getUsers = () => {
    const buddyList = this.client.getBuddylist()
    if (!buddyList || !Array.isArray(buddyList.user)) {
      return []
    }

    return buddyList.user.map(user => ({
      id: user.user_id,
      name: user.name,
      avatar: user.profile_image_url,
      status: getUserStatusFromCode(user.status),
      statusText: user.display,
    }))
  }

  getUnreadChats = async () => {
    const res: UcReceieveUnreadText = await new Promise((resolve, reject) => {
      this.client.receiveUnreadText(resolve, reject)
    })

    if (!res || !Array.isArray(res.messages)) {
      return []
    }

    const readRequiredMessageIds = res.messages
      .filter(msg => msg.requires_read)
      .map(msg => msg.received_text_id)
    this.client.readText(readRequiredMessageIds)

    return res.messages.map(msg => ({
      id: msg.received_text_id,
      text: msg.text,
      creator: msg.sender && msg.sender.user_id,
      created: msg.sent_ltime,
    }))
  }

  getBuddyChats = async (
    buddy: string,
    opts: {
      max?: number
      begin?: number
      end?: number
      asc?: boolean
    } = {},
  ) => {
    const res: UcSearchTexts = await new Promise((resolve, reject) =>
      this.client.searchTexts(
        {
          user_id: buddy,
          max: opts.max,
          begin: opts.begin,
          end: opts.end,
          asc: opts.asc,
        },
        resolve,
        reject,
      ),
    )

    if (!res || !Array.isArray(res.logs)) {
      return []
    }

    return res.logs.map(l => {
      return {
        id: l.log_id,
        text: l.content,
        type: l.ctype,
        creator: l.sender.user_id,
        created: l.ltime,
      }
    })
  }

  getGroupChats = async (
    group: string,
    opts: {
      max?: number
      begin?: number
      end?: number
      asc?: boolean
    } = {},
  ) => {
    const res: UcSearchTexts = await new Promise((resolve, reject) =>
      this.client.searchTexts(
        {
          conf_id: group,
          max: opts.max,
          begin: opts.begin,
          end: opts.end,
          asc: opts.asc,
        },
        resolve,
        reject,
      ),
    )

    if (!res || !Array.isArray(res.logs)) {
      return []
    }

    return res.logs.map(l => ({
      id: l.log_id,
      text: l.content,
      type: l.ctype,
      creator: l.sender.user_id,
      created: l.ltime,
    }))
  }

  sendBuddyChatText = (buddy: string, text: string) => {
    return new Promise((resolve, reject) =>
      this.client.sendText(
        text,
        {
          user_id: buddy,
        },
        res =>
          resolve({
            id: res.text_id,
            text,
            creator: this.client.getProfile().user_id,
            created: res.ltime,
            ctype: Constants.CTYPE_TEXT,
          }),
        reject,
      ),
    )
  }

  sendCallResult = (duration: number, target: string) => {
    const text = JSON.stringify({ talklen: duration })
    return new Promise((resolve, reject) =>
      this.client.sendCallResult(
        { user_id: target },
        text,
        res =>
          resolve({
            id: res.text_id,
            text,
            creator: this.client.getProfile().user_id,
            created: res.ltime,
            ctype: Constants.CTYPE_CALL_RESULT,
          }),
        reject,
      ),
    )
  }

  sendGroupChatText = (group: string, text: string) => {
    return new Promise((resolve, reject) =>
      this.client.sendConferenceText(
        text,
        group,
        res =>
          resolve({
            id: res.text_id,
            text,
            creator: this.client.getProfile().user_id,
            created: res.ltime,
          }),
        reject,
      ),
    )
  }

  createChatGroup = async (name: string, members: string[] = []) => {
    const res: {
      conference: UcConference
    } = await new Promise((resolve, reject) => {
      this.client.createConference(name, members, resolve, reject)
    })

    return {
      id: res.conference.conf_id,
      name: res.conference.subject,
      jointed: true,
    }
  }

  joinChatGroup = async (group: string) => {
    await new Promise((resolve, reject) => {
      this.client.joinConference(
        group,
        undefined,
        () => resolve(undefined),
        reject,
      )
    })

    return {
      id: group,
    }
  }

  answerWebchatConference = async (conf_id: string) => {
    await new Promise((resolve, reject) => {
      this.client.joinConference(
        conf_id,
        { exclusive: true },
        () => resolve(undefined),
        reject,
      )
    })
  }
  joinWebchatConference = async (conf_id: string) => {
    await new Promise((resolve, reject) => {
      this.client.joinConference(
        conf_id,
        { exclusive: false },
        () => resolve(undefined),
        reject,
      )
    })
  }
  leaveChatGroup = async (group: string) => {
    await new Promise((resolve, reject) => {
      this.client.leaveConference(group, () => resolve(undefined), reject)
    })

    return {
      id: group,
    }
  }

  inviteChatGroupMembers = (group: string, members: string[]) => {
    return new Promise((resolve, reject) => {
      this.client.inviteToConference(
        group,
        members,
        () => resolve(undefined),
        reject,
      )
    })
  }

  acceptFile = (file: string) => {
    const res = new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.responseType = 'blob'

      xhr.onload = function () {
        if (this.status === 200) {
          resolve(this['response'])
        }
      }

      this.client.acceptFileWithXhr(file, xhr, reject)
    })
    return res
  }

  rejectFile = async (file: { id?: string; file_id_target?: string[] }) => {
    if (file.file_id_target) {
      file.file_id_target.map(f => {
        return new Promise((resolve, reject) => {
          this.client.cancelFile(f, (err?: Error) => {
            if (err) {
              reject(err)
            } else {
              resolve(undefined)
            }
          })
        })
      })
    } else if (file.id) {
      return new Promise((resolve, reject) => {
        this.client.cancelFile(file.id || '', (err?: Error) => {
          if (err) {
            reject(err)
          } else {
            resolve(undefined)
          }
        })
      })
    }
  }

  sendFile = async (user_id: string, file: Blob) => {
    let inputw: HTMLInputElement | null = null
    if (Platform.OS === 'web') {
      inputw = document.createElement('input')
      inputw.type = 'file'
      inputw.name = 'file'
      inputw.files = (() => {
        let b: DataTransfer | null = null
        if (window.DataTransfer) {
          b = new DataTransfer()
        } else if (window.ClipboardEvent) {
          b = new ClipboardEvent('').clipboardData
        }
        if (!b) {
          console.error('Can not set input.files')
          return null
        }

        b.items.add(file as File)
        return b.files
      })()
      const form = document.createElement('form')
      form.appendChild(inputw)
    }

    let inputrn: object | null = null
    if (Platform.OS !== 'web') {
      const fd = new FormData()
      fd.append('file', {
        ...file,
        type: 'multipart/form-data',
      })
      inputrn = {
        form: 'This is not a form element, see app/apis/uc.js for detail',
        files: [file],
        __rnFormData: fd,
      }
    }

    const res: UcSendFile = await new Promise((resolve, reject) =>
      this.client.sendFile(
        {
          user_id,
        },
        inputw || inputrn,
        resolve,
        reject,
      ),
    )
    return {
      file: {
        id: res.fileInfo.file_id,
        name: res.fileInfo.name,
        size: res.fileInfo.size,
        state: getFileStateFromCode(res.fileInfo.status),
        transferPercent: res.fileInfo.progress,
      },

      chat: {
        id: res.text_id,
        file: res.fileInfo.file_id,
        type: -1, // TODO
        creator: this.client.getProfile().user_id,
        created: res.ltime,
      },
    }
  }

  sendFiles = async (conf_id: string, file: Blob) => {
    let inputw: HTMLInputElement | null = null
    if (Platform.OS === 'web') {
      inputw = document.createElement('input')
      inputw.type = 'file'
      inputw.name = 'file'
      inputw.files = (() => {
        let b: DataTransfer | null = null
        if (window.DataTransfer) {
          b = new DataTransfer()
        } else if (window.ClipboardEvent) {
          const e = new ClipboardEvent('')
          b = e.clipboardData
        }
        if (!b) {
          console.error('Can not set input.files')
          return null
        }
        b.items.add(file as File)
        return b.files
      })()
      const form = document.createElement('form')
      form.appendChild(inputw)
    }

    let inputrn: object | null = null
    if (Platform.OS !== 'web') {
      const fd = new FormData()

      fd.append('file', {
        ...file,
        type: 'multipart/form-data',
      })

      inputrn = {
        form: 'This is not a form element, see app/apis/uc.js for detail',
        files: [file],
        __rnFormData: fd,
      }
    }

    const res: UcSendFiles = await new Promise((resolve, reject) =>
      this.client.sendFiles(
        {
          conf_id,
          input: inputw || inputrn,
        },
        [file],
        resolve,
        reject,
      ),
    )
    const file_res = res.infoList[0]
    return {
      file: {
        id: file_res.fileInfo.file_id,
        name: file_res.fileInfo.name,
        // file_id_target: file_res.fileInfos.map(f => f.file_id),
        size: file_res.fileInfo.size,
        state: getFileStateFromCode(file_res.fileInfo.status),
        transferPercent: file_res.fileInfo.progress,
      },

      chat: {
        id: file_res.text_id,
        file: file_res.fileInfo.file_id,
        type: -1, // TODO
        creator: this.client.getProfile().user_id,
        created: file_res.ltime,
      },
    }
  }

  peekWebchatConferenceText = async (conf_id: string) => {
    const res: UcWebchatConferenceText = await new Promise((resolve, reject) =>
      this.client.peekWebchatConferenceText({ conf_id }, resolve, reject),
    )
    if (!res.messages.length) {
      return []
    }
    return res.messages.map(message => message.text)
  }
}

export default new UC()
