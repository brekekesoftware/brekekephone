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
  const [dev, setDev] = useState<Build[]>([])
  const [prod, setProd] = useState<Build[]>([])
  const prodM = prod.filter(b => b.ipa || b.apk)
  const prodW = prod.filter(b => b.zip)
  useEffect(() => {
    window
      .fetch('https://apps.brekeke.com/api/builds')
      .then(r => r.json())
      .then((arr: string[]) => {
        if (!Array.isArray(arr)) {
          return
        }
        const buildsArr: Builds[] = [{}, {}] // [dev, prod]
        arr.forEach(name => {
          const matches = /(\d+\.\d+\.\d+)\.(ipa|apk|zip)/.exec(name)
          if (!matches) {
            return
          }
          const version = matches[1]
          const env = matches[2]
          const i = name.includes('dev') ? 0 : 1
          if (!buildsArr[i][version]) {
            buildsArr[i][version] = { version }
          }
          Object.assign(buildsArr[i][version], { [env]: true })
        })
        buildsArr
          .map(builds => Object.values(builds))
          .forEach((builds, i) => {
            if (builds.length) {
              const f = i ? setProd : setDev
              f(builds.sort((a, b) => semverCompare(b.version, a.version)))
            }
          })
      })
  }, [])
  return (
    <>
      {[dev, prodM].map((arr, i) => {
        if (!arr.length) {
          return <Fragment key={i} />
        }
        return (
          <Fragment key={i}>
            <h3>Brekeke Phone{i ? '' : ' Dev'}</h3>
            {arr.map(b => {
              const v = `${i ? '' : 'dev'}${b.version}`
              const ipa = b.ipa && `/0/brekeke_phone${v}.ipa`
              const apk = b.apk && `/0/brekeke_phone${v}.apk`
              return (
                <>
                  <div className='version'>
                    <strong>{b.version}</strong>{' '}
                    <LastModified url={ipa || apk || ''} />
                  </div>
                  {apk && (
                    <div>
                      <a href={apk}>Download apk</a>
                    </div>
                  )}
                  {ipa && (
                    <div>
                      <a
                        href={`itms-services://?action=download-manifest&url=https://apps.brekeke.com/api/plist/${v}`}
                      >
                        Install on iOS
                      </a>
                    </div>
                  )}
                </>
              )
            })}
          </Fragment>
        )
      })}
      {!!prodW.length && (
        <>
          <h3>Web Phone</h3>
          {prodW.map(b => {
            const url = `/0/brekeke_phone${b.version}.zip`
            return (
              <>
                <div className='version'>
                  <strong>{b.version}</strong> <LastModified url={url} />
                </div>
                <div>
                  <a href={url}>Download zip</a>
                </div>
              </>
            )
          })}
        </>
      )}
    </>
  )
}
