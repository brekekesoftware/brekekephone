import { observer } from 'mobx-react'
import moment from 'moment'
import { Component } from 'react'
import { StyleSheet } from 'react-native'

import { mdiKeyboardBackspace } from '#/assets/icons'
import { Field } from '#/components/Field'
import { Layout } from '#/components/Layout'
import { RnText } from '#/components/Rn'
import { currentVersion, isWeb } from '#/config'
import { ctx } from '#/stores/ctx'
import { compareSemVer } from '#/stores/debugStore'
import { intl } from '#/stores/intl'

const css = StyleSheet.create({
  BtnIcon: {
    transform: [
      {
        rotate: '180deg',
      },
    ],
  },
  Text: {
    paddingHorizontal: 20,
  },
})

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
              createBtnIconStyle={css.BtnIcon}
              label={intl`OPEN DEBUG LOG`}
              onCreateBtnPress={ctx.nav.goToPageSettingsDebugFiles}
              onTouchPress={ctx.nav.goToPageSettingsDebugFiles}
              value={ctx.debug.getLogSizeStr()}
            />

            <Field hasMargin isGroup label={intl`UPDATE`} />
            <Field
              createBtnIcon={mdiKeyboardBackspace}
              createBtnIconStyle={css.BtnIcon}
              label={intl`UPDATE`}
              onCreateBtnPress={ctx.debug.openInStore}
              onTouchPress={ctx.debug.openInStore}
              value={intl`Open ${ctx.global.productName} on store`}
            />
            <RnText
              normal
              primary={!isUpdateAvailable}
              small
              style={css.Text}
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
            <RnText normal primary small style={css.Text}>
              {intl`Current version: ${currentVersion}`}
            </RnText>
            <RnText normal warning small style={css.Text}>
              {intl`You are running an in-browser version of ${ctx.global.productName}`}
            </RnText>
          </>
        )}
      </Layout>
    )
  }
}
