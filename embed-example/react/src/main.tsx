// @ts-ignore
import './main.css'

declare global {
  interface Window {
    Brekeke: any
    _BrekekePhoneEmbedImports: any
  }
}

const brekekePhoneDiv = document.getElementById('brekeke_phone')
const exampleAccount = {
  hostname: 'YOUR_PBX_HOSTNAME',
  port: 'YOUR_PBX_PORT',
  tenant: 'TENANT',
  username: 'USERNAME',
  password: 'PASSWORD',
  uc: true,
}
const renderOptions = {
  autoLogin: false,
  accounts: [exampleAccount],
}
const phone = window.Brekeke.Phone.render(brekekePhoneDiv, renderOptions)

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
  location.pathname.replace(/\/+$/, '') + '/brekeke_phone3.0.0'
const version = phone.getCurrentVersion()

const imports = window._BrekekePhoneEmbedImports
const { observer } = imports['mobx-react']
const { useEffect, useRef, useState } = imports['react']
const { createRoot } = imports['react-dom/client']

// --- Embed MFA demo (left panel only; right panel = webphone untouched) ---
// Listen to the `mfa` event and surface status + a running event log.
const mfaStatus = imports.mobx.observable.box('-')
const mfaLog: any = imports.mobx.observable.array([])
phone.on('mfa', (e: any) => {
  console.log('[embed mfa]', e)
  mfaStatus.set(e.status)
  mfaLog.unshift(
    new Date().toLocaleTimeString() +
      '  ' +
      e.status +
      (e.message ? ' - ' + e.message : ''),
  )
})

// Host reuses the webphone's built-in OTP UI (right panel).
// Host only needs the `mfa` event to know when to show/hide its container.
const MfaEvent = observer(() => {
  const status = mfaStatus.get()
  const shouldShow = status === 'required' || status === 'error'
  const [otp, setOtp] = useState('')
  const [apiResult, setApiResult] = useState('')
  const run = async (label: string, fn: () => any) => {
    try {
      const r = await fn()
      setApiResult(label + ' -> ' + JSON.stringify(r ?? null))
    } catch (e: any) {
      setApiResult(label + ' error: ' + (e?.message || String(e)))
    }
  }
  return (
    <div
      style={{
        border: '1px solid #999',
        padding: 10,
        marginTop: 10,
      }}
    >
      <b>MFA event</b>
      <div>
        event status: <b>{status}</b>
      </div>
      <div>
        host action:{' '}
        <span
          style={{
            padding: '2px 8px',
            borderRadius: 4,
            color: 'white',
            background: shouldShow ? '#2e7d32' : '#757575',
          }}
        >
          {shouldShow ? 'SHOW OTP screen webphone' : 'HIDE OTP screen webphone'}
        </span>
      </div>
      <div
        style={{
          fontSize: 12,
          color: '#555',
          marginTop: 6,
        }}
      >
        The built-in OTP modal appears in the right panel; host just toggles its
        own container on these events.
      </div>
      <div
        style={{
          marginTop: 8,
        }}
      >
        <b>API controls for this OTP screen</b>
        <div
          style={{
            display: 'flex',
            gap: 6,
            margin: '8px 0',
            flexWrap: 'wrap',
          }}
        >
          <input
            placeholder='OTP code'
            value={otp}
            onChange={e => setOtp(e.target.value)}
            style={{
              padding: 4,
            }}
          />
          <button
            onClick={() => run('verifyMfaCode', () => phone.verifyMfaCode(otp))}
          >
            Verify
          </button>
          <button
            onClick={() => run('resendMfaCode', () => phone.resendMfaCode())}
          >
            Resend
          </button>
          <button onClick={() => run('cancelMfa', () => phone.cancelMfa())}>
            Cancel
          </button>
          <button onClick={() => run('getMfaState', () => phone.getMfaState())}>
            getState
          </button>
        </div>
        {apiResult && (
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: 12,
              color: '#1565c0',
            }}
          >
            {apiResult}
          </div>
        )}
      </div>
      <div
        style={{
          marginTop: 8,
        }}
      >
        <b>events</b>
        <ul
          style={{
            margin: 0,
            paddingLeft: 18,
            maxHeight: 140,
            overflow: 'auto',
          }}
        >
          {mfaLog.map((l: string, i: number) => (
            <li
              key={i}
              style={{
                fontFamily: 'monospace',
                fontSize: 12,
              }}
            >
              {l}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
})

let ocPalClient: any

const closeOcPalClient = () => {
  ocPalClient?.close?.()
  ocPalClient = undefined
}
const getTenantForPal = (tenant: string) => tenant || '-'
const createOcPalClient = ({
  hostname,
  port,
  tenant,
  user,
  password,
}: {
  hostname: string
  port: string
  tenant: string
  user: string
  password: string
}) => {
  const client = window.Brekeke.pbx.getPal(`wss://${hostname}:${port}/pbx/ws`, {
    tenant: getTenantForPal(tenant),
    login_user: user,
    login_password: password,
    secure_login_password: false,
    phonetype: 'webphone',
    ctype: 2,
  })
  client.debugLevel = 2
  return client
}
const loginOcPal = (client: any) =>
  new Promise<void>((resolve, reject) => {
    client.login(resolve, reject)
  })
const callOcPal = (client: any, method: string, params: any) =>
  new Promise<any>((resolve, reject) => {
    client[method](params, resolve, reject)
  })
const getWebphoneAccountOptions = ({
  hostname,
  port,
  tenant,
  user,
  password,
}: {
  hostname: string
  port: string
  tenant: string
  user: string
  password: string
}) => ({
  hostname,
  port,
  tenant,
  username: user,
  password,
  uc: true,
})

const DeviceTokenApiTest = observer(() => {
  const storageKey = 'brekeke.example.setDeviceToken'
  const saved = (() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '{}')
    } catch {
      return {}
    }
  })()
  const [hostname, setHostname] = useState(
    saved.hostname || exampleAccount.hostname,
  )
  const [port, setPort] = useState(saved.port || exampleAccount.port)
  const [tenant, setTenant] = useState(saved.tenant || exampleAccount.tenant)
  const [user, setUser] = useState(saved.user || exampleAccount.username)
  const [password, setPassword] = useState(
    saved.password || exampleAccount.password,
  )
  const [ipAddress, setIpAddress] = useState(saved.ipAddress || '')
  const [userAgent, setUserAgent] = useState(
    saved.userAgent || navigator.userAgent,
  )
  const [otp, setOtp] = useState('')
  const [sessKey, setSessKey] = useState(saved.sessKey || '')
  const [token, setToken] = useState(saved.token || '')
  const [ocResult, setOcResult] = useState('')
  const [result, setResult] = useState('')
  const [inspectResult, setInspectResult] = useState('')
  const [loading, setLoading] = useState('')

  const saveInputs = () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        hostname,
        port,
        tenant,
        user,
        password,
        ipAddress,
        userAgent,
        sessKey,
        token,
      }),
    )
  }
  const useRenderAccount = () => {
    setHostname(exampleAccount.hostname)
    setPort(exampleAccount.port)
    setTenant(exampleAccount.tenant)
    setUser(exampleAccount.username)
    setPassword(exampleAccount.password)
  }
  const useCurrentAccount = () => {
    const ca = phone.getCurrentAccount()
    if (!ca) {
      setOcResult('No current account')
      return
    }
    setHostname(ca.pbxHostname || '')
    setPort(ca.pbxPort || '')
    setTenant(ca.pbxTenant || '-')
    setUser(ca.pbxUsername || '')
    setPassword(ca.pbxPassword || '')
  }
  const fetchPublicIp = async () => {
    setLoading('ip')
    try {
      const res = await fetch('https://api.ipify.org?format=json')
      const data = await res.json()
      setIpAddress(data.ip || '')
      setOcResult('public ip -> ' + JSON.stringify(data))
    } catch (e: any) {
      setOcResult('fetch public ip error: ' + (e?.message || String(e)))
    } finally {
      setLoading('')
    }
  }
  const connectAndStartMfa = async () => {
    setLoading('mfa-start')
    setOcResult('')
    saveInputs()
    try {
      closeOcPalClient()
      ocPalClient = createOcPalClient({
        hostname,
        port,
        tenant,
        user,
        password,
      })
      await loginOcPal(ocPalClient)
      const res = await callOcPal(ocPalClient, 'mfa/start', {
        tenant: getTenantForPal(tenant),
        user,
        ip_address: ipAddress,
      })
      if (res?.sess_key) {
        setSessKey(res.sess_key)
      }
      setOcResult('mfa/start -> ' + JSON.stringify(res))
    } catch (e: any) {
      closeOcPalClient()
      setOcResult('mfa/start error: ' + (e?.message || String(e)))
    } finally {
      setLoading('')
    }
  }
  const verifyOtpAndCreateToken = async () => {
    setLoading('token-create')
    setOcResult('')
    saveInputs()
    try {
      if (!ocPalClient) {
        ocPalClient = createOcPalClient({
          hostname,
          port,
          tenant,
          user,
          password,
        })
        await loginOcPal(ocPalClient)
      }
      const checkRes = await callOcPal(ocPalClient, 'mfa/check', {
        tenant: getTenantForPal(tenant),
        user,
        sess_key: sessKey,
        code: otp,
      })
      if (checkRes?.status !== 'OK') {
        setOcResult('mfa/check -> ' + JSON.stringify(checkRes))
        return
      }
      const createRes = await callOcPal(ocPalClient, 'device_token/create', {
        tenant: getTenantForPal(tenant),
        user,
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      if (createRes?.token) {
        setToken(createRes.token)
      }
      setOcResult(
        'mfa/check -> ' +
          JSON.stringify(checkRes) +
          '\ndevice_token/create -> ' +
          JSON.stringify(createRes),
      )
    } catch (e: any) {
      setOcResult('create token error: ' + (e?.message || String(e)))
    } finally {
      setLoading('')
    }
  }
  const runSetDeviceToken = async () => {
    setLoading('set-token')
    setResult('')
    setInspectResult('')
    saveInputs()
    try {
      await phone.restart({
        ...renderOptions,
        autoLogin: false,
        clearExistingAccount: true,
        accounts: [
          getWebphoneAccountOptions({
            hostname,
            port,
            tenant,
            user,
            password,
          }),
        ],
      })
      const r = await phone.setDeviceToken({
        hostname,
        port,
        tenant,
        user,
        token,
      })
      setResult(
        'sync webphone account -> OK\nsetDeviceToken -> ' + JSON.stringify(r),
      )
    } catch (e: any) {
      setResult('error: ' + (e?.message || String(e)))
    } finally {
      setLoading('')
    }
  }
  const inspectSavedToken = () => {
    const data = ctx.account.findDataSync({
      pbxHostname: hostname,
      pbxPort: port,
      pbxTenant: tenant,
      pbxUsername: user,
    })
    setInspectResult(
      JSON.stringify(
        {
          hasData: !!data,
          palDeviceToken: data?.palParams?.device_token || null,
          mfaVerified: data?.mfa?.verified || false,
          mfaPending: data?.mfa?.pending || false,
          mfaTokenKeys: Object.keys(data?.mfa?.token || {}),
        },
        null,
        2,
      ),
    )
  }

  return (
    <div
      style={{
        border: '1px solid #999',
        padding: 10,
        marginTop: 10,
      }}
    >
      <b>OC MFA simulator + setDeviceToken API</b>
      <div
        style={{
          marginTop: 8,
        }}
      >
        <button onClick={useRenderAccount} disabled={!!loading}>
          Use render account
        </button>
        <button
          style={{
            marginLeft: 8,
          }}
          onClick={useCurrentAccount}
          disabled={!!loading}
        >
          Use current account
        </button>
      </div>
      <div className='device-token-grid'>
        <label>
          Host
          <input value={hostname} onChange={e => setHostname(e.target.value)} />
        </label>
        <label>
          Port
          <input value={port} onChange={e => setPort(e.target.value)} />
        </label>
        <label>
          Tenant
          <input value={tenant} onChange={e => setTenant(e.target.value)} />
        </label>
        <label>
          User
          <input value={user} onChange={e => setUser(e.target.value)} />
        </label>
        <label>
          Password
          <input
            type='password'
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </label>
        <label>
          IP address
          <input
            value={ipAddress}
            onChange={e => setIpAddress(e.target.value)}
          />
        </label>
      </div>
      <label className='device-token-field'>
        User agent
        <textarea
          value={userAgent}
          onChange={e => setUserAgent(e.target.value)}
        />
      </label>
      <div
        style={{
          marginTop: 8,
        }}
      >
        <button onClick={fetchPublicIp} disabled={!!loading}>
          {loading === 'ip' ? 'Fetching...' : 'Fetch public IP'}
        </button>
        <button
          style={{
            marginLeft: 8,
          }}
          onClick={connectAndStartMfa}
          disabled={!!loading}
        >
          {loading === 'mfa-start' ? 'Starting...' : 'OC mfa/start'}
        </button>
      </div>
      <div className='device-token-grid'>
        <label>
          Session key
          <input value={sessKey} onChange={e => setSessKey(e.target.value)} />
        </label>
        <label>
          OTP
          <input value={otp} onChange={e => setOtp(e.target.value)} />
        </label>
      </div>
      <div
        style={{
          marginTop: 8,
        }}
      >
        <button onClick={verifyOtpAndCreateToken} disabled={!!loading}>
          {loading === 'token-create'
            ? 'Creating token...'
            : 'OC mfa/check + device_token/create'}
        </button>
        <button
          style={{
            marginLeft: 8,
          }}
          onClick={closeOcPalClient}
          disabled={!!loading}
        >
          Disconnect OC PAL
        </button>
      </div>
      {ocResult && <pre className='device-token-result'>{ocResult}</pre>}
      <label className='device-token-field'>
        Device token
        <textarea value={token} onChange={e => setToken(e.target.value)} />
      </label>
      <div
        style={{
          marginTop: 8,
        }}
      >
        <button onClick={runSetDeviceToken} disabled={!!loading}>
          {loading === 'set-token' ? 'Connecting...' : 'setDeviceToken'}
        </button>
        <button
          style={{
            marginLeft: 8,
          }}
          onClick={() => setToken('invalid-token-for-test')}
          disabled={!!loading}
        >
          Use invalid token
        </button>
        <button
          style={{
            marginLeft: 8,
          }}
          onClick={inspectSavedToken}
          disabled={!!loading}
        >
          Inspect saved token
        </button>
      </div>
      {result && <pre className='device-token-result'>{result}</pre>}
      {inspectResult && (
        <pre className='device-token-result'>{inspectResult}</pre>
      )}
    </div>
  )
})

const App = observer(() => {
  const inputRef = useRef()
  const [cameras, setCameras] = useState([])
  const [microphones, setMicrophones] = useState([])
  const [speakers, setSpeakers] = useState([])
  const [selectedCamera, setSelectedCamera] = useState('')
  const [selectedMicrophone, setSelectedMicrophone] = useState('')
  const [selectedSpeaker, setSelectedSpeaker] = useState(null)
  const [isLoadingDevices, setIsLoadingDevices] = useState(true)
  const [switchError, setSwitchError] = useState('')
  const [switchSuccess, setSwitchSuccess] = useState('')

  useEffect(() => {
    const loadDevices = async () => {
      try {
        setIsLoadingDevices(true)
        const [camerasData, microphonesData, speakersData] = await Promise.all([
          phone.getAvailableCameras(),
          phone.getAvailableMicrophones(),
          phone.getAvailableSpeakers(),
        ])

        handleMic(microphonesData)
        handleCamera(camerasData)
        handleSpeaker(speakersData)
      } catch (error) {
        console.error('Error loading devices:', error)
      } finally {
        setIsLoadingDevices(false)
      }
    }

    loadDevices()
  }, [])

  const clearMessages = () => {
    setSwitchError('')
    setSwitchSuccess('')
  }

  const handleCameraChange = async (deviceId: string) => {
    clearMessages()

    try {
      const c = await phone.setVideoInputDevice(deviceId)
      if (!c) {
        setSwitchError(
          'Failed to switch video. Device may no longer be available.',
        )
        return
      }
      setSelectedCamera(deviceId)
      setSwitchSuccess('Camera switched successfully')
      setTimeout(clearMessages, 2000)
    } catch (error) {
      const errorMsg =
        // @ts-ignore
        error?.message ||
        'Failed to switch camera. Device may no longer be available.'
      setSwitchError(errorMsg)
      console.error('Error setting camera:', error)
    } finally {
      setTimeout(clearMessages, 2000)
    }
  }

  const handleMicrophoneChange = async (deviceId: string) => {
    clearMessages()

    try {
      const c = phone.setAudioInputDevice(deviceId)
      if (!c) {
        setSwitchError(
          'Failed to switch microphone. Device may no longer be available.',
        )
        return
      }
      setSelectedMicrophone(deviceId)
      setSwitchSuccess('Microphone switched successfully')
    } catch (error: any) {
      const errorMsg =
        error?.message ||
        'Failed to switch microphone. Device may no longer be available.'
      setSwitchError(errorMsg)
      console.error('Microphone switch error:', error)

      // reload devices in case one was unplugged
      const updatedMicrophones = await phone.getAvailableMicrophones()
      setMicrophones(updatedMicrophones)
    } finally {
      setTimeout(clearMessages, 2000)
    }
  }

  const handleSpeakerChange = async (deviceId: string) => {
    clearMessages()

    try {
      const c = await phone.setAudioOutputDevice(deviceId)
      if (!c) {
        setSwitchError(
          'Failed to switch speaker. The device has automatically reverted to default settings.',
        )
        return
      }
      setSelectedSpeaker(phone.getAudioOutputDevice())
      setSwitchSuccess('Speaker switched successfully')
    } catch (error: any) {
      const errorMsg =
        error?.message ||
        'Failed to switch speaker. Device may no longer be available.'
      setSwitchError(errorMsg)
      console.error('Speaker switch error:', error)

      // reload devices in case one was unplugged
      const updatedSpeakers = await phone.getAvailableSpeakers()
      setSpeakers(updatedSpeakers)
    } finally {
      setTimeout(clearMessages, 2000)
    }
  }

  const handleSpeaker = s => {
    setSpeakers(s)
    if (s.length > 0) {
      setSelectedSpeaker(getPreferredDeviceId(s).deviceId)
    }
  }

  const handleMic = m => {
    setMicrophones(m)
    if (m.length > 0) {
      setSelectedMicrophone(getPreferredDeviceId(m).deviceId)
    }
  }

  const handleCamera = c => {
    setCameras(c)
    if (c.length > 0) {
      setSelectedCamera(getPreferredDeviceId(c).deviceId)
    }
  }

  const getPreferredDeviceId = devices =>
    devices.find(d => d.deviceId === 'default') ?? devices[0]

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
      <span>Calls - {ctx.call.calls.length} | </span>
      <span>MFA - {mfaStatus.get()} </span>
      <hr />

      <div
        style={{
          marginBottom: '10px',
        }}
      >
        <label
          htmlFor='camera-select'
          style={{
            marginRight: '8px',
          }}
        >
          Camera:
        </label>
        <select
          id='camera-select'
          value={selectedCamera}
          onChange={e => handleCameraChange(e.target.value)}
          disabled={isLoadingDevices || cameras.length === 0}
          style={{
            padding: '4px',
            minWidth: '200px',
          }}
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

      <div
        style={{
          marginBottom: '10px',
        }}
      >
        <label
          htmlFor='microphone-select'
          style={{
            marginRight: '8px',
          }}
        >
          Microphone:
        </label>
        <select
          id='microphone-select'
          value={selectedMicrophone}
          onChange={e => handleMicrophoneChange(e.target.value)}
          disabled={isLoadingDevices || microphones.length === 0}
          style={{
            padding: '4px',
            minWidth: '200px',
          }}
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
      </div>
      <div
        style={{
          marginBottom: '10px',
        }}
      >
        <label
          htmlFor='speaker-select'
          style={{
            marginRight: '8px',
          }}
        >
          Speaker:
        </label>
        <select
          id='speaker-select'
          value={selectedSpeaker?.deviceId || ''}
          onChange={e => handleSpeakerChange(e.target.value)}
          disabled={isLoadingDevices || speakers.length === 0}
          style={{
            padding: '4px',
            minWidth: '200px',
          }}
        >
          {speakers.length === 0 ? (
            <option value=''>No speaker available</option>
          ) : (
            speakers.map(s => (
              <option key={s.deviceId} value={s.deviceId}>
                {getDeviceLabel(s)}
              </option>
            ))
          )}
        </select>
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
      <hr />

      <input ref={inputRef} />
      <button onClick={makeCallAudio}>Make call audio</button>
      <button onClick={makeCallVideo}>Make call video</button>
      <hr />

      <DeviceTokenApiTest />
      <MfaEvent />

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
