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
  _patched = false

  _originalGetUserMedia: typeof navigator.mediaDevices.getUserMedia | null =
    null

  async init() {
    this._audioInputDeviceId = this._getPreferredDeviceId(
      await this.getAudioInputDevices(),
    )
    this._videoInputDeviceId = this._getPreferredDeviceId(
      await this.getVideoInputDevices(),
    )
    this._syncPatch()
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

  getAudioInputDevices(): Promise<DeviceInfo[]> {
    return this._getDevicesByKind('audioinput')
  }

  getVideoInputDevices(): Promise<DeviceInfo[]> {
    return this._getDevicesByKind('videoinput')
  }

  destroy(): void {
    this._restorePatch()
    this._audioInputDeviceId = ''
    this._videoInputDeviceId = ''
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
    console.log('[WebRTCDeviceManager]: kind ', kind)
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
}

export const embedDevicesManager = new EmbedDevicesManager()
