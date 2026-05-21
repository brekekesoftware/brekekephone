import { observer } from 'mobx-react'
import moment from 'moment'
import { Component } from 'react'
import { mdiKeyboardBackspace } from '#/assets/icons'
import { Field } from '#/components/field'
import { Layout } from '#/components/layout'
import { RnText } from '#/components/rn'
import { currentVersion, isWeb } from '#/config'
import { ctx } from '#/stores/ctx'
import { compareSemVer } from '#/stores/debug-store'
import { intl } from '#/stores/intl'
import { darkModeDisabled, darkModeEnabled } from '@/rn/core/dark-mode/config'
import { useDarkModeUser, useSetDarkMode } from '@/rn/core/dark-mode/index.native'

const DarkModePicker = () => {
  const d = useDarkModeUser()
  const setDarkMode = useSetDarkMode()
   return <Field
      label={intl`DARKMODE`}
      onValueChange={v => {
        setDarkMode(v === 'undefined' ? undefined : v === darkModeEnabled ? true : false)
      }}
      type='RnPicker'
      options={[
        { key: darkModeEnabled, label: intl`Always Dark` },
        { key: darkModeDisabled, label: intl`Always Light` },
        { key: 'undefined', label: intl`System Automatic` },
      ]}
      value={d === undefined ? 'undefined' : d ? darkModeEnabled : darkModeDisabled}
    />
}

@observer
export class PageSettingsDebug extends Component {
  render() {
    const isUpdateAvailable =
      !isWeb && compareSemVer(ctx.debug.remoteVersion, currentVersion) > 0
    return (
      <Layout
        description={intl`App information and debugging`}
        dropdown={
          !isWeb
            ? [
                {
                  label: intl`Clear all log files`,
                  onPress: ctx.debug.clearLogFiles,
                  danger: true,
                },
                {
                  label: intl`Manually check for update`,
                  onPress: ctx.debug.checkForUpdate,
                },
              ]
            : undefined
        }
        onBack={ctx.nav.backToPageAccountSignIn}
        title={intl`Debug`}
      >
        <DarkModePicker />
        {!isWeb && (
          <>
            <Field isGroup label={intl`DEBUG LOG`} />
            <Field
              label={intl`CAPTURE ALL DEBUG LOG`}
              onValueChange={ctx.debug.toggleCaptureDebugLog}
              type='Switch'
              value={ctx.debug.captureDebugLog}
            />
            <Field
              createBtnIcon={mdiKeyboardBackspace}
              createBtnIconClassName='rotate-180'
              label={intl`OPEN DEBUG LOG`}
              onCreateBtnPress={ctx.nav.goToPageSettingsDebugFiles}
              onTouchPress={ctx.nav.goToPageSettingsDebugFiles}
              value={ctx.debug.getLogSizeStr()}
            />

            <Field hasMargin isGroup label={intl`UPDATE`} />
            <Field
              createBtnIcon={mdiKeyboardBackspace}
              createBtnIconClassName='rotate-180'
              label={intl`UPDATE`}
              onCreateBtnPress={ctx.debug.openInStore}
              onTouchPress={ctx.debug.openInStore}
              value={intl`Open ${ctx.global.productName} on store`}
            />
            <RnText
              normal
              primary={!isUpdateAvailable}
              small
              className='px-5'
              warning={isUpdateAvailable}
            >
              {intl`Current version: ${currentVersion}`}
              {'\n'}
              {ctx.debug.isCheckingForUpdate
                ? intl`Checking for update...`
                : isUpdateAvailable
                  ? intl`A new version is available: ${ctx.debug.remoteVersion}`
                  : intl`${ctx.global.productName} is up-to-date, checked ${moment(
                      ctx.debug.remoteVersionLastCheck,
                    ).fromNow()}`}
            </RnText>
          </>
        )}
        {isWeb && (
          <>
            <RnText normal primary small className='px-5'>
              {intl`Current version: ${currentVersion}`}
            </RnText>
            <RnText normal warning small className='px-5'>
              {intl`You are running an in-browser version of ${ctx.global.productName}`}
            </RnText>
          </>
        )}
      </Layout>
    )
  }
}
