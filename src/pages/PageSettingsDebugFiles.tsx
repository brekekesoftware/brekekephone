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
        description={intl`Debug Files`}
        dropdown={
          Platform.OS !== 'web'
            ? [
                {
                  label: intl`Clear all log files`,
                  onPress: debugStore.clearLogFiles,
                  danger: true,
                },
              ]
            : undefined
        }
        onBack={Nav().backToPageAccountSignIn}
        title={intl`Debug Files`}
      >
        <Field isGroup label={intl`LOG FILES (${logFiles.length})`} />
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
