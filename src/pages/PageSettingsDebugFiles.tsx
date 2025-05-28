import { filesize } from 'filesize'
import { observer } from 'mobx-react'
import { Component } from 'react'
import { Platform, StyleSheet } from 'react-native'

import { mdiKeyboardBackspace } from '../assets/icons'
import { Field } from '../components/Field'
import { Layout } from '../components/Layout'
import { debugStore } from '../stores/debugStore'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'

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
    const logFiles = debugStore.logFiles
    return (
      <Layout
        title={intl`Debug Log`}
        description={intl`Debug Log`}
        dropdown={
          Platform.OS !== 'web'
            ? [
                {
                  label: intl`Clear all Debug Log`,
                  onPress: debugStore.clearLogFiles,
                  danger: true,
                },
              ]
            : undefined
        }
        onBack={Nav().backToPageAccountSignIn}
      >
        <Field isGroup label={intl`DEBUG LOG (${logFiles.length})`} />
        {logFiles.length > 0 &&
          logFiles.map(file => (
            <Field
              key={file.path}
              createBtnIcon={mdiKeyboardBackspace}
              createBtnIconStyle={css.BtnIcon}
              label={file.name}
              onCreateBtnPress={() => debugStore.openLogFile(file)}
              onTouchPress={() => debugStore.openLogFile(file)}
              value={`${filesize(file.size)}`}
            />
          ))}
      </Layout>
    )
  }
}
