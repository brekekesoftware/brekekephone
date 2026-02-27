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

  setAudioInputDevice(deviceId: string): void {
    this._audioInputDeviceId = deviceId || null
    this._applyPatch()
  }

  setVideoInputDevice(deviceId: string): void {
    this._videoInputDeviceId = deviceId || null
    this._applyPatch()
  }

  clearDeviceSelection(): void {
    this._audioInputDeviceId = null
    this._videoInputDeviceId = null
    this._restorePatch()
  }

  async getAudioInputDevices(): Promise<DeviceInfo[]> {
    return this._getDevicesByKind('audioinput')
  }

  /** Lấy danh sách tất cả video input devices */
  async getVideoInputDevices(): Promise<DeviceInfo[]> {
    return this._getDevicesByKind('videoinput')
  }

  switchMicrophoneDuringCall(
    phone: any,
    deviceId: string,
    sessionId: string | null = null,
  ): void {
    if (!phone) {
      throw new Error('[WebRTCDeviceManager] phone instance is required')
    }
    if (!deviceId) {
      throw new Error('[WebRTCDeviceManager] deviceId is required')
    }

    this._audioInputDeviceId = deviceId
    this._applyPatch()

    const constraints: MediaStreamConstraints = {
      audio: { deviceId: { exact: deviceId } },
      video: false,
    }

    phone.reconnectMicrophone(sessionId, { mediaConstraints: constraints })
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
    } // closure đã bind `this`, không cần patch lại

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
  }

  /** Restore về hàm gốc */
  private _restorePatch(): void {
    if (!this._patched || !this._originalGetUserMedia) {
      return
    }

    navigator.mediaDevices.getUserMedia = this._originalGetUserMedia
    this._originalGetUserMedia = null
    this._patched = false
  }

  /**
   * Inject deviceId vào constraints dựa trên _audioInputDeviceId / _videoInputDeviceId.
   * Không mutate object gốc.
   */
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
}

export const embedDevicesManager = new EmbedDevicesManager()
