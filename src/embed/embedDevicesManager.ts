import type { Session } from '#/brekekejs'
import { ctx } from '#/stores/ctx'

export interface DeviceInfo {
  deviceId: string
  label: string
  kind: MediaDeviceKind
}
class EmbedDevicesManager {
  _audioInputDeviceId = ''
  _videoInputDeviceId = ''
  _audioOutputDevice: DeviceInfo | null = null
  _audioElements: Set<HTMLAudioElement> = new Set()
  _deviceChangeHandler: (() => void) | null = null
  _patched = false

  _originalGetUserMedia: typeof navigator.mediaDevices.getUserMedia | null =
    null
  async init() {
    const [audioInputs, videoInputs, audioOutputs] = await Promise.all([
      this.getAudioInputDevices(),
      this.getVideoInputDevices(),
      this.getAudioOutputDevices(),
    ])

    this._audioInputDeviceId = this._getPreferredDeviceId(audioInputs)
    this._videoInputDeviceId = this._getPreferredDeviceId(videoInputs)
    this._audioOutputDevice = this._getPreferredOutputDeviceId(audioOutputs)
    this._syncPatch()
    embedDevicesManager.initDeviceChangeListener()
  }

  setAudioInputDevice(deviceId: string): boolean {
    this._audioInputDeviceId = deviceId
    this._syncPatch()
    const ca = ctx.call.getOngoingCall()
    if (ca) {
      const phone = ctx.sip.phone
      if (!phone) {
        console.error('[WebRTCDeviceManager] phone instance is required')
        return false
      }
      if (!deviceId) {
        console.error('[WebRTCDeviceManager] deviceId is required')
        return false
      }
      const ssID = ca.rawSession?.sessionId
      const constraints: MediaStreamConstraints = {
        audio: { deviceId: { exact: deviceId } },
        video: false,
      }

      // if sessionId is undefined it will get the last sessionId instead
      phone.reconnectMicrophone(ssID, { mediaConstraints: constraints })
    }

    return true
  }

  async setVideoInputDevice(deviceId: string): Promise<boolean> {
    const ca = ctx.call.getOngoingCall()
    if (ca) {
      if (!deviceId) {
        return false
      }
      // if sessionId is empty it will get the last sessionId instead
      const ssID = ca.rawSession?.sessionId ?? ''
      const s = ctx.sip.phone?.getSession(ssID)
      if (!s) {
        console.error('[WebRTCDeviceManager] No session found')
        return false
      }

      const senders = this._getVideoSenders(s)
      if (senders.length === 0) {
        console.error(
          '[WebRTCDeviceManager] No video sender found in any PeerConnection',
        )
        return false
      }
      const oldTrack = senders[0].track
      const getUserMedia =
        this._originalGetUserMedia ??
        navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)

      const newStream = await getUserMedia({
        video: { deviceId: { exact: deviceId } },
        audio: false,
      })

      const [newVideoTrack] = newStream.getVideoTracks()
      if (!newVideoTrack) {
        console.error('[WebRTCDeviceManager] No video track in new stream')
        return false
      }

      try {
        await Promise.all(
          senders.map(sender => sender.replaceTrack(newVideoTrack)),
        )
        const localVideoStream: MediaStream | null =
          s.localVideoStreamObject ?? null
        if (localVideoStream && oldTrack) {
          localVideoStream.removeTrack(oldTrack)
          localVideoStream.addTrack(newVideoTrack)
        }
        oldTrack?.stop()
      } catch (error) {
        newVideoTrack.stop()
        console.error(
          '[WebRTCDeviceManager] Failed to switch camera during call:',
          error,
        )
        return false
      }
    }
    this._syncPatch()
    this._videoInputDeviceId = deviceId

    return true
  }

  async setAudioOutputDevice(deviceId: string): Promise<boolean> {
    const devices = await this.getAudioOutputDevices()

    const device = devices.find(d => d.deviceId === deviceId)

    if (!device) {
      console.warn('[WebRTCDeviceManager] Device not found, fallback default')

      this._audioOutputDevice = {
        deviceId: 'default',
        label: 'default',
        kind: 'audiooutput',
      }
    } else {
      this._audioOutputDevice = device
    }
    let hasError = false
    const p: Promise<void>[] = []

    for (const el of this._audioElements) {
      if (typeof el.setSinkId !== 'function') {
        continue
      }

      p.push(
        el.setSinkId(this._audioOutputDevice.deviceId).catch(async () => {
          console.warn('[WebRTCDeviceManager] setSinkId failed, fallback')
          try {
            await el.setSinkId('default')
          } catch {
            hasError = true
            console.warn('[WebRTCDeviceManager] setSinkId default also failed')
          }
        }),
      )
    }

    await Promise.all(p)
    return !hasError
  }

  getAudioInputDevices(): Promise<DeviceInfo[]> {
    return this._getDevicesByKind('audioinput')
  }

  getVideoInputDevices(): Promise<DeviceInfo[]> {
    return this._getDevicesByKind('videoinput')
  }

  getAudioOutputDevices(): Promise<DeviceInfo[]> {
    return this._getDevicesByKind('audiooutput')
  }

  destroy(): void {
    this._restorePatch()
    this._audioInputDeviceId = ''
    this._videoInputDeviceId = ''
    this._audioOutputDevice = null
    this._audioElements.clear()
    this.removeDeviceChangeListener()
  }

  _applyPatch(): void {
    if (!this._isGetUserMediaAvailable()) {
      return
    }
    if (this._patched) {
      return
    }

    this._originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(
      navigator.mediaDevices,
    )

    const self = this

    navigator.mediaDevices.getUserMedia = function (
      constraints?: MediaStreamConstraints,
    ): Promise<MediaStream> {
      const patched = self._injectDeviceIds(constraints ?? {})
      return self._originalGetUserMedia!(patched)
    }

    this._patched = true
    console.log(
      `[WebRTCDeviceManager] Applied patch for device management, audioInputDeviceId=${this._audioInputDeviceId}, videoInputDeviceId=${this._videoInputDeviceId}`,
    )
  }

  _syncPatch() {
    const hasAnyDevice =
      !!this._audioInputDeviceId || !!this._videoInputDeviceId
    if (hasAnyDevice) {
      this._applyPatch()
    } else {
      this._restorePatch()
    }
  }

  _restorePatch(): void {
    if (!this._patched || !this._originalGetUserMedia) {
      return
    }

    navigator.mediaDevices.getUserMedia = this._originalGetUserMedia
    this._originalGetUserMedia = null
    this._patched = false
  }

  _injectDeviceIds(
    constraints: MediaStreamConstraints,
  ): MediaStreamConstraints {
    const result: MediaStreamConstraints = { ...constraints }

    if (this._audioInputDeviceId && constraints.audio !== false) {
      result.audio = {
        ...(typeof constraints.audio === 'object' ? constraints.audio : {}),
        deviceId: { exact: this._audioInputDeviceId },
      }
    }

    if (this._videoInputDeviceId && constraints.video !== false) {
      result.video = {
        ...(typeof constraints.video === 'object' ? constraints.video : {}),
        deviceId: { exact: this._videoInputDeviceId },
      }
    }

    return result
  }

  _isGetUserMediaAvailable(): boolean {
    return (
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function'
    )
  }

  async _getDevicesByKind(kind: MediaDeviceKind): Promise<DeviceInfo[]> {
    if (!this._isGetUserMediaAvailable()) {
      return []
    }

    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices
      .filter(d => d.kind === kind)
      .map(d => ({
        deviceId: d.deviceId,
        label: d.label || `${kind} (${d.deviceId.slice(0, 8)}...)`,
        kind: d.kind,
      }))
  }

  _getVideoSenders = (session?: Session): RTCRtpSender[] => {
    if (!session) {
      console.error('[WebRTCDeviceManager] No active session found')
      return []
    }

    const videoClientSessions = Object.values(
      session.videoClientSessionTable ?? {},
    )

    if (videoClientSessions.length === 0) {
      console.error(
        '[WebRTCDeviceManager] No video client session found. ' +
          'Make sure the call was started with withVideo: true.',
      )
      return []
    }

    const senders: RTCRtpSender[] = []
    for (const vcs of videoClientSessions) {
      const videoPC = vcs.rtcSession.connection
      if (!videoPC) {
        continue
      }
      const sender = videoPC.getSenders().find(s => s.track?.kind === 'video')
      if (sender) {
        senders.push(sender)
      }
    }
    return senders
  }

  _getPreferredDeviceId(devices: DeviceInfo[]): string {
    if (devices.length === 0) {
      return ''
    }
    return (
      devices.find(d => d.deviceId === 'default')?.deviceId ??
      devices[0].deviceId
    )
  }

  // Output method

  _getPreferredOutputDeviceId(devices: DeviceInfo[]) {
    if (devices.length === 0) {
      return null
    }
    return devices.find(d => d.deviceId === 'default') ?? devices[0]
  }

  async registerAudioElement(el: HTMLAudioElement) {
    console.log(
      '[WebRTCDeviceManager] registerAudioElement, _audioOutputDevice:',
      this._audioOutputDevice,
    )

    this._audioElements.add(el)

    if (!this._audioOutputDevice) {
      return
    }
    if (typeof el.setSinkId !== 'function') {
      return
    }

    try {
      await el.setSinkId(this._audioOutputDevice.deviceId)
    } catch {
      // deviceId may have changed since last enumeration, re-match by label
      const devices = await this.getAudioOutputDevices()
      const matched =
        devices.find(d => d.deviceId === this._audioOutputDevice!.deviceId) ||
        devices.find(d => d.label === this._audioOutputDevice!.label)
      const fallbackId = matched?.deviceId ?? 'default'
      try {
        await el.setSinkId(fallbackId)
      } catch {
        console.warn('[WebRTCDeviceManager] Failed to set sink on register')
      }
      if (matched) {
        this._audioOutputDevice = matched
      }
    }
  }

  unregisterAudioElement(el: HTMLAudioElement) {
    this._audioElements.delete(el)
  }

  initDeviceChangeListener() {
    if (!navigator.mediaDevices?.addEventListener) {
      return
    }

    // tránh register nhiều lần
    if (this._deviceChangeHandler) {
      return
    }

    this._deviceChangeHandler = async () => {
      console.log('[WebRTCDeviceManager] devicechange triggered')

      if (!this._audioOutputDevice) {
        return
      }

      const devices = await this.getAudioOutputDevices()
      const matched = devices.find(
        d =>
          d.deviceId === this._audioOutputDevice!.deviceId ||
          d.label === this._audioOutputDevice!.label,
      )

      const newDeviceId = matched?.deviceId ?? 'default'

      const p: Promise<void>[] = []
      for (const el of this._audioElements) {
        if (typeof el.setSinkId !== 'function') {
          continue
        }
        p.push(
          el.setSinkId(newDeviceId).catch(async () => {
            try {
              await el.setSinkId('default')
            } catch {
              // ignore
            }
          }),
        )
      }
      await Promise.all(p)

      if (matched) {
        this._audioOutputDevice = matched
      }
    }

    navigator.mediaDevices.addEventListener(
      'devicechange',
      this._deviceChangeHandler,
    )
  }

  removeDeviceChangeListener() {
    if (this._deviceChangeHandler) {
      navigator.mediaDevices.removeEventListener(
        'devicechange',
        this._deviceChangeHandler,
      )
      this._deviceChangeHandler = null
    }
  }
}

export const embedDevicesManager = new EmbedDevicesManager()
