import { Fragment, useEffect, useState } from 'react'
import semverCompare from 'semver-compare'

import { LastModified } from './LastModified'

type Build = {
  version: string
  ipa?: boolean
  apk?: boolean
  zip?: boolean
}
type Builds = {
  [v: string]: Build
}

export const App = () => {
  const isPathInvoke = window.location.pathname.includes('invoke')
  const invokeHyphen = isPathInvoke ? 'invoke-' : ''
  const invokeSlash = isPathInvoke ? 'invoke/' : ''
  const api = `https://dev01.brekeke.com/dev-api/${invokeHyphen}builds`
  const plist = `itms-services://?action=download-manifest&url=https://dev01.brekeke.com/dev-api/${invokeHyphen}plist/`

  const [dev, setDev] = useState<Build[]>([])
  const [showExtraDev, setShowExtraDev] = useState(false)
  const [prod, setProd] = useState<Build[]>([])
  const [invoke, setInvoke] = useState<Build[]>([])
  const [showExtraProd, setShowExtraProd] = useState(false)
  const [showExtraWeb, setShowExtraWeb] = useState(false)
  const [showExtraInvoke, setShowExtraInvoke] = useState(false)
  const prodM = prod.filter(b => b.ipa || b.apk)
  const prodW = prod.filter(b => b.zip)
  useEffect(() => {
    window
      .fetch(api)
      .then(r => r.json())
      .then((arr: string[]) => {
        if (!Array.isArray(arr)) {
          return
        }
        const buildsArr: Builds[] = [{}, {}, {}] // [dev, prod]
        arr.forEach(name => {
          const matches = /(\d+\.\d+\.\d+)\.(ipa|apk|zip)/.exec(name)
          if (!matches) {
            return
          }
          const version = matches[1]
          const env = matches[2]
          const i = name.includes('invoke') ? 0 : name.includes('dev') ? 1 : 2
          if (!buildsArr[i][version]) {
            buildsArr[i][version] = { version }
          }
          Object.assign(buildsArr[i][version], { [env]: true })
        })
        buildsArr
          .map(builds => Object.values(builds))
          .forEach((builds, i) => {
            if (builds.length) {
              const f = i === 0 ? setInvoke : i === 1 ? setDev : setProd
              f(builds.sort((a, b) => semverCompare(b.version, a.version)))
            }
          })
      })
  }, [])
  return (
    <>
      {[invoke, dev, prodM, prodW].map((arr, i) => {
        if (!arr.length) {
          return <Fragment key={i} />
        }
        const isInvoke = i === 0
        const isDev = i === 1
        const isProd = i === 2
        const isWeb = i === 3
        const title = isInvoke
          ? 'Invoke Example'
          : isDev
            ? `Brekeke Phone${isPathInvoke ? ' Ex App' : ''} Dev`
            : isProd
              ? 'Brekeke Phone'
              : 'Web Phone'
        const url = isInvoke
          ? '/upload/invoke/invoke'
          : `/upload/${invokeSlash}brekeke_phone`
        const showExtra = isInvoke
          ? showExtraInvoke
          : isDev
            ? showExtraDev
            : isProd
              ? showExtraProd
              : showExtraWeb
        const setShowExtra = isInvoke
          ? setShowExtraInvoke
          : isDev
            ? setShowExtraDev
            : isProd
              ? setShowExtraProd
              : setShowExtraWeb
        return (
          <Fragment key={i}>
            <h3>{title}</h3>
            {arr.map((b, j) => {
              const v = `${isDev ? 'dev' : ''}${b.version}`
              const ipa = b.ipa && `${url}${v}.ipa`
              const apk = b.apk && `${url}${v}.apk`
              const zip = `${url}${v}.zip`
              return (
                <div
                  key={b.version}
                  className={j > 2 && !showExtra ? 'hidden' : undefined}
                >
                  <div className='version'>
                    <strong>{b.version}</strong>{' '}
                    <LastModified url={ipa || apk || ''} />
                  </div>
                  {isWeb ? (
                    <div>
                      <a href={zip}>Download zip</a>
                    </div>
                  ) : (
                    <>
                      {apk && (
                        <div>
                          <a href={apk}>Download apk</a>
                        </div>
                      )}
                      {ipa && (
                        <div>
                          <a href={`${plist}${v}`}>Install on iOS</a>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
            <Extra
              length={arr.length}
              show={showExtra}
              setShow={setShowExtra}
            />
          </Fragment>
        )
      })}
    </>
  )
}

const Extra = (p: { length: number; show: boolean; setShow: Function }) => {
  if (p.length <= 3 || p.show) {
    return null
  }
  return (
    <div className='extra'>
      <span onClick={() => p.setShow(true)}>
        {'>'} Show {p.length - 3} older builds
      </span>
    </div>
  )
}
