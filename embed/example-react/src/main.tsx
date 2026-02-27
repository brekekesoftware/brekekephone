import './main.css'

declare global {
  interface Window {
    Brekeke: any
    _BrekekePhoneEmbedImports: any
  }
}

const brekekePhoneDiv = document.getElementById('brekeke_phone')
const phone = window.Brekeke.Phone.render(brekekePhoneDiv, {
  autoLogin: false,
  accounts: [
    {
      hostname: 'YOUR_PBX_HOSTNAME',
      port: 'YOUR_PBX_PORT',
      tenant: 'TENANT',
      username: 'USERNAME',
      password: 'PASSWORD',
      uc: true,
    },
  ],
})

const customizedPromptBrowserPermission1 = () => {
  const div = document.createElement('div')
  div.style =
    'position: fixed; inset: 0; padding-top: 50px; background: rgba(0,0,0,0.8); color: white; text-align: center; font-weight: bold; cursor: pointer; z-index: 9999;'
  div.innerHTML = 'Customized prompt for permission 1'
  div.addEventListener('click', () => {
    document.body.removeChild(div)
    phone.acceptBrowserPermission()
  })
  document.body.appendChild(div)
}
const customizedPromptBrowserPermission2 = () => {
  window.alert('Customized prompt for permission 2')
  phone.acceptBrowserPermission()
}

const useCustomizedPrompt: number = 1
if (useCustomizedPrompt === 1) {
  customizedPromptBrowserPermission1()
} else if (useCustomizedPrompt === 2) {
  customizedPromptBrowserPermission2()
} else {
  phone.promptBrowserPermission()
}

const ctx = phone.getCurrentAccountCtx()
ctx.intl.setLocale('en')
ctx.global.embedStaticPath =
  location.pathname.replace(/\/+$/, '') + '/brekeke_phone2.17.0'
const version = phone.getCurrentVersion()

const imports = window._BrekekePhoneEmbedImports
const { observer } = imports['mobx-react']
const { useEffect, useRef, useState } = imports['react']
const { createRoot } = imports['react-dom/client']

const App = observer(() => {
  const inputRef = useRef()
  const [cameras, setCameras] = useState([])
  const [microphones, setMicrophones] = useState([])
  const [selectedCamera, setSelectedCamera] = useState('')
  const [selectedMicrophone, setSelectedMicrophone] = useState('')
  const [isLoadingDevices, setIsLoadingDevices] = useState(true)
  const [switchError, setSwitchError] = useState('')
  const [switchSuccess, setSwitchSuccess] = useState('')

  // Load available devices on mount
  useEffect(() => {
    const loadDevices = async () => {
      try {
        setIsLoadingDevices(true)
        const [camerasData, microphonesData] = await Promise.all([
          phone.getAvailableCameras(),
          phone.getAvailableMicrophones(),
        ])
        setCameras(camerasData)
        setMicrophones(microphonesData)

        // Set first device as default if available
        if (camerasData.length > 0 && !selectedCamera) {
          setSelectedCamera(camerasData[0].deviceId)
        }
        if (microphonesData.length > 0 && !selectedMicrophone) {
          setSelectedMicrophone(microphonesData[0].deviceId)
          phone.setAudioInputDevice(microphonesData[0].deviceId)
        }
      } catch (error) {
        console.error('Error loading devices:', error)
      } finally {
        setIsLoadingDevices(false)
      }
    }

    loadDevices()

    // Listen for device changes (e.g., camera/microphone plugged/unplugged)
    const handleDeviceChange = () => {
      loadDevices()
    }

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)
    phone.listenDebug()
    return () => {
      navigator.mediaDevices.removeEventListener(
        'devicechange',
        handleDeviceChange,
      )
    }
  }, [])

  const handleCameraChange = async (e: any) => {
    const deviceId = e.target.value
    setSelectedCamera(deviceId)
    try {
    } catch (error) {
      console.error('Error setting camera:', error)
    }
  }

  const handleMicrophoneChange = async (e: any) => {
    const deviceId = e.target.value
    setSelectedMicrophone(deviceId)
    setSwitchError('')
    setSwitchSuccess('')

    // Clear messages after 3 seconds
    const clearMessages = () => {
      setSwitchError('')
      setSwitchSuccess('')
    }

    try {
      const c = ctx.call.getOngoingCall()
      if (c) {
        phone.switchMicrophoneDuringCall(deviceId, c.sessionId)
      } else {
        phone.setAudioInputDevice(deviceId)
      }
      setSwitchSuccess('Microphone switched successfully')
      setTimeout(clearMessages, 3000)
    } catch (error: any) {
      const errorMsg =
        error?.message ||
        'Failed to switch microphone. Device may no longer be available.'
      setSwitchError(errorMsg)
      console.error('Microphone switch error:', error)

      // Reload devices in case one was unplugged
      const updatedMicrophones = await phone.getAvailableMicrophones()
      setMicrophones(updatedMicrophones)

      setTimeout(clearMessages, 5000)
    }
  }

  const makeCallAudio = () => {
    ctx.call.startCall(inputRef.current.value)
  }
  const makeCallVideo = () => {
    ctx.call.startCall(inputRef.current.value, undefined, true)
  }

  const getDeviceLabel = (device: MediaDeviceInfo): string =>
    device.label || `Device ${device.deviceId.substring(0, 5)}`

  return (
    <div className='app'>
      <span>Web Phone - {version.webphone} | </span>
      <span>JsSIP - {version.jssip} | </span>
      <span>{version.bundleIdentifier} </span>
      <hr />

      <span>Status: </span>
      <span>PBX - {ctx.auth.pbxState} | </span>
      <span>SIP - {ctx.auth.sipState} | </span>
      <span>Calls - {ctx.call.calls.length} </span>
      <hr />

      <div style={{ marginBottom: '10px' }}>
        <label htmlFor='camera-select' style={{ marginRight: '8px' }}>
          Camera:
        </label>
        <select
          id='camera-select'
          value={selectedCamera}
          onChange={handleCameraChange}
          disabled={isLoadingDevices || cameras.length === 0}
          style={{ padding: '4px', minWidth: '200px' }}
        >
          {cameras.length === 0 ? (
            <option value=''>No cameras available</option>
          ) : (
            cameras.map(camera => (
              <option key={camera.deviceId} value={camera.deviceId}>
                {getDeviceLabel(camera)}
              </option>
            ))
          )}
        </select>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label htmlFor='microphone-select' style={{ marginRight: '8px' }}>
          Microphone:
        </label>
        <select
          id='microphone-select'
          value={selectedMicrophone}
          onChange={handleMicrophoneChange}
          disabled={isLoadingDevices || microphones.length === 0}
          style={{ padding: '4px', minWidth: '200px' }}
        >
          {microphones.length === 0 ? (
            <option value=''>No microphones available</option>
          ) : (
            microphones.map(microphone => (
              <option key={microphone.deviceId} value={microphone.deviceId}>
                {getDeviceLabel(microphone)}
              </option>
            ))
          )}
        </select>
        <button
          className='call-answer'
          onClick={() => phone.debugDevices()}
          style={{ marginLeft: '8px' }}
        >
          Debug
        </button>
      </div>

      {switchError && (
        <div
          style={{
            color: '#d32f2f',
            backgroundColor: '#ffebee',
            padding: '8px',
            marginBottom: '10px',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          {switchError}
        </div>
      )}

      {switchSuccess && (
        <div
          style={{
            color: '#388e3c',
            backgroundColor: '#e8f5e9',
            padding: '8px',
            marginBottom: '10px',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          ✓ {switchSuccess}
        </div>
      )}

      <input ref={inputRef} />
      <button onClick={makeCallAudio}>Make call audio</button>
      <button onClick={makeCallVideo}>Make call video</button>
      <hr />

      {ctx.call.calls.map(c => (
        <Call call={c} />
      ))}
    </div>
  )
})

const reactRootDiv = document.getElementById('root')
createRoot(reactRootDiv).render(<App />)

const Call = observer(({ call }) => (
  <div className='call-item'>
    <span className='call-from'>
      Call Display Name: {call.getDisplayName()}
    </span>

    {call.incoming && !call.answered && (
      <button className='call-answer' onClick={() => call.answer()}>
        Answer
      </button>
    )}
    {call.incoming && !call.answered && (
      <button
        className='call-answer'
        onClick={() => call.answer(undefined, true)}
      >
        Answer with video
      </button>
    )}
    {call.answered && (
      <button className='call-answer' onClick={() => call.toggleVideo()}>
        Toggle video
      </button>
    )}
    <button className='call-hangup' onClick={() => call.hangupWithUnhold()}>
      Hangup
    </button>

    <div>local video enabled: {call.getLocalVideoEnabled().toString()}</div>
    <div>remote video enabled: {call.getRemoteVideoEnabled().toString()}</div>

    <div className='call-video-items'>
      <div>
        My camera:
        <Video stream={call.localStreamObject} />
      </div>
      {call.videoClientSessionTable.map(v => {
        const audioEnabled = !call.remoteUserOptionsTable?.[v.user]?.muted?.main
        const videoEnabled =
          !call.remoteUserOptionsTable?.[v.user]?.muted?.videoClient
        return (
          <div>
            <span>{v.user}'s camera:</span>
            <span> audio={audioEnabled.toString()}</span>
            <span> video={videoEnabled.toString()}</span>
            <Video stream={v.remoteStreamObject} />
          </div>
        )
      })}
    </div>
    <hr />
  </div>
))

const Video = observer(({ stream }) => {
  const r = useRef()
  useEffect(() => {
    if (r.current && stream) {
      r.current.srcObject = stream
    }
  }, [stream])
  return <video className='video-item' ref={r} playsInline autoPlay />
})
