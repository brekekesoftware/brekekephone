import { filesize } from 'filesize'
import { observer } from 'mobx-react'
import { Component } from 'react'
import { StyleSheet } from 'react-native'

import { mdiKeyboardBackspace } from '#/assets/icons'
import { Field } from '#/components/Field'
import { Layout } from '#/components/Layout'
import { isWeb } from '#/config'
import { ctx } from '#/stores/ctx'
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
export class PageSettingsDebugFiles extends Component {
  render() {
    const logFiles = ctx.debug.logFiles
    return (
      <Layout
        title={intl`Debug Log`}
        description={intl`Debug Log`}
        dropdown={
          !isWeb
            ? [
                {
                  label: intl`Clear all Debug Log`,
                  onPress: ctx.debug.clearLogFiles,
                  danger: true,
                },
              ]
            : undefined
        }
        onBack={ctx.nav.backToPageAccountSignIn}
      >
        <Field isGroup label={intl`DEBUG LOG (${logFiles.length})`} />
        {logFiles.length > 0 &&
          logFiles.map(file => (
            <Field
              key={file.path}
              createBtnIcon={mdiKeyboardBackspace}
              createBtnIconStyle={css.BtnIcon}
              label={file.name}
              onCreateBtnPress={() => ctx.debug.openLogFile(file)}
              onTouchPress={() => ctx.debug.openLogFile(file)}
              value={`${filesize(file.size)}`}
            />
          ))}
      </Layout>
    )
  }
}
