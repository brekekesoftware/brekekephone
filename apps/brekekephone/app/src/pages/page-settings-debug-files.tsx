import { filesize } from 'filesize'
import { observer } from 'mobx-react'
import { Component } from 'react'

import { isWeb } from '@/rn/core/utils/platform'
import { mdiKeyboardBackspace } from '#/assets/icons'
import { Field } from '#/components/field'
import { Layout } from '#/components/layout'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'

export const PageSettingsDebugFiles = observer(
  class PageSettingsDebugFiles extends Component {
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
                createBtnIconClassName='rotate-180'
                label={file.name}
                onCreateBtnPress={() => ctx.debug.openLogFile(file)}
                onTouchPress={() => ctx.debug.openLogFile(file)}
                value={`${filesize(file.size)}`}
              />
            ))}
        </Layout>
      )
    }
  },
)
