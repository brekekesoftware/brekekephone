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
  location.pathname.replace(/\/+$/, '') + '/brekeke_phone2.16.8'
const version = phone.getCurrentVersion()

const imports = window._BrekekePhoneEmbedImports
const { observer } = imports['mobx-react']
const { useEffect, useRef } = imports['react']
const { createRoot } = imports['react-dom/client']

const App = observer(() => {
  const inputRef = useRef()
  const makeCallAudio = () => {
    ctx.call.startCall(inputRef.current.value)
  }
  const makeCallVideo = () => {
    ctx.call.startCall(inputRef.current.value, undefined, true)
  }

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
