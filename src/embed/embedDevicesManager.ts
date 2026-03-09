export interface DeviceInfo {
  deviceId: string
  label: string
  kind: MediaDeviceKind
}
class EmbedDevicesManager {
  private _audioInputDeviceId: string | null = null
  private _videoInputDeviceId: string | null = null
  private _patched = false

  private _originalGetUserMedia:
    | typeof navigator.mediaDevices.getUserMedia
    | null = null

  async init() {
    this._audioInputDeviceId = this._getPreferredDeviceId(
      await this.getAudioInputDevices(),
    )
    this._videoInputDeviceId = this._getPreferredDeviceId(
      await this.getVideoInputDevices(),
    )
    this._syncPatch()
  }

  setAudioInputDevice(deviceId: string): void {
    this._audioInputDeviceId = deviceId || null
    this._syncPatch()
  }

  setVideoInputDevice(deviceId: string): void {
    this._videoInputDeviceId = deviceId || null
    this._syncPatch()
  }

  clearDeviceSelection(): void {
    this._audioInputDeviceId = null
    this._videoInputDeviceId = null
    this._restorePatch()
  }

  async getAudioInputDevices(): Promise<DeviceInfo[]> {
    return this._getDevicesByKind('audioinput')
  }

  async getVideoInputDevices(): Promise<DeviceInfo[]> {
    return this._getDevicesByKind('videoinput')
  }

  getCurrentDeviceIdSelected = () => ({
    audio: this._audioInputDeviceId,
    video: this._videoInputDeviceId,
  })

  listenDeviceChanges(callback: () => void): void {
    navigator.mediaDevices.addEventListener('devicechange', callback)
  }

  unlistenDeviceChanges(callback: () => void): void {
    navigator.mediaDevices.removeEventListener('devicechange', callback)
  }

  switchMicrophoneDuringCall(
    phone: any,
    deviceId: string,
    sessionId: string | null = null,
  ): boolean {
    if (!phone) {
      console.error('[WebRTCDeviceManager] phone instance is required')
      return false
    }
    if (!deviceId) {
      console.error('[WebRTCDeviceManager] deviceId is required')
      return false
    }

    this._audioInputDeviceId = deviceId
    this._syncPatch()

    const constraints: MediaStreamConstraints = {
      audio: { deviceId: { exact: deviceId } },
      video: false,
    }

    phone.reconnectMicrophone(sessionId, { mediaConstraints: constraints })
    return true
  }

  async switchCameraDuringCall(s: any, deviceId: string): Promise<boolean> {
    if (!deviceId) {
      console.error('[WebRTCDeviceManager] deviceId is required')
      return false
    }
    const sender = this._getVideoSender(s)

    if (!sender) {
      console.error(
        '[WebRTCDeviceManager] No video sender found in PeerConnection',
      )
      return false
    }
    const oldTrack = sender.track
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
      await sender.replaceTrack(newVideoTrack)
      const localVideoStream: MediaStream | null =
        s?.localVideoStreamObject ?? null
      // update localVideoStream if exists
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

    this._videoInputDeviceId = deviceId
    this._syncPatch()
    return true
  }

  destroy(): void {
    this._restorePatch()
    this._audioInputDeviceId = null
    this._videoInputDeviceId = null
  }

  // -------------------------------------------------------------------------
  // Private: Monkey-patch
  // -------------------------------------------------------------------------

  private _applyPatch(): void {
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
      `Applied patch for device management, audioInputDeviceId=${this._audioInputDeviceId}, videoInputDeviceId=${this._videoInputDeviceId}`,
    )
  }

  private _syncPatch() {
    const hasAnyDevice =
      !!this._audioInputDeviceId || !!this._videoInputDeviceId
    if (hasAnyDevice) {
      this._applyPatch()
    } else {
      this._restorePatch()
    }
  }

  private _restorePatch(): void {
    if (!this._patched || !this._originalGetUserMedia) {
      return
    }

    navigator.mediaDevices.getUserMedia = this._originalGetUserMedia
    this._originalGetUserMedia = null
    this._patched = false
  }

  private _injectDeviceIds(
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

  // -------------------------------------------------------------------------
  // Private: Helpers
  // -------------------------------------------------------------------------

  private _isGetUserMediaAvailable(): boolean {
    return (
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function'
    )
  }

  private async _getDevicesByKind(
    kind: MediaDeviceKind,
  ): Promise<DeviceInfo[]> {
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

  private _getVideoSender = (session: any) => {
    if (!session) {
      console.error('[WebRTCDeviceManager] No active session found')
      return
    }
    const videoClientSessions = Object.values(
      session.videoClientSessionTable ?? {},
    ) as any
    if (videoClientSessions.length === 0) {
      console.error(
        '[WebRTCDeviceManager] No video client session found. ' +
          'Make sure the call was started with withVideo: true.',
      )
      return
    }
    const videoPC = videoClientSessions[0].rtcSession.connection
    if (!videoPC) {
      console.error('[WebRTCDeviceManager] Video PeerConnection not ready yet')
      return
    }
    return videoPC.getSenders().find(s => s.track?.kind === 'video')
  }

  private _getPreferredDeviceId(devices: DeviceInfo[]): string | null {
    if (devices.length === 0) {
      return null
    }
    return (
      devices.find(d => d.deviceId === 'default')?.deviceId ??
      devices[0].deviceId
    )
  }
}

export const embedDevicesManager = new EmbedDevicesManager()
