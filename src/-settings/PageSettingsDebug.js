import { mdiKeyboardBackspace } from '@mdi/js';
import filesize from 'filesize';
import { observer } from 'mobx-react';
import moment from 'moment';
import React, { Component } from 'react';

import { Platform, StyleSheet, Text } from '../-/Rn';
import g from '../global';
import debugStore from '../global/debugStore';
import intl from '../intl/intl';
import Field from '../shared/Field';
import Layout from '../shared/Layout';

const css = StyleSheet.create({
  BtnIcon: {
    transform: [
      {
        rotate: `180deg`,
      },
    ],
  },
  Text: {
    paddingHorizontal: 20,
  },
});

@observer
class PageSettingsDebug extends Component {
  render() {
    const v = debugStore.currentVersion;
    const nv = debugStore.remoteVersion;
    const ago = moment(debugStore.remoteVersionLastCheck).fromNow();

    return (
      <Layout
        description={intl`App information and debugging`}
        dropdown={
          Platform.OS !== `web`
            ? [
                {
                  label: intl`Clear all log files`,
                  onPress: debugStore.clearLogFiles,
                  danger: true,
                },
                {
                  label: intl`Manually check for update`,
                  onPress: debugStore.checkForUpdate,
                },
              ]
            : null
        }
        onBack={g.backToPageProfileSignIn}
        title={intl`Debug`}
      >
        {Platform.OS !== `web` && (
          <React.Fragment>
            <Field isGroup label={intl`DEBUG LOG`} />
            <Field
              label={intl`CAPTURE ALL DEBUG LOG`}
              onValueChange={debugStore.toggleCaptureDebugLog}
              type="Switch"
              value={debugStore.captureDebugLog}
            />
            <Field
              createBtnIcon={mdiKeyboardBackspace}
              createBtnIconStyle={css.BtnIcon}
              label={intl`OPEN DEBUG LOG`}
              onCreateBtnPress={debugStore.openLogFile}
              onTouchPress={debugStore.openLogFile}
              value={filesize(debugStore.logSize, { round: 0 })}
            />

            <Field hasMargin isGroup label={intl`UPDATE`} />
            <Field
              createBtnIcon={mdiKeyboardBackspace}
              createBtnIconStyle={css.BtnIcon}
              label={intl`UPDATE`}
              onCreateBtnPress={debugStore.openInStore}
              onTouchPress={debugStore.openInStore}
              value={intl`Open Brekeke Phone on store`}
            />
            <Text
              normal
              primary={!debugStore.isUpdateAvailable}
              small
              style={css.Text}
              warning={debugStore.isUpdateAvailable}
            >
              {intl`Current version: ${v}`}
              {`\n`}
              {debugStore.isCheckingForUpdate
                ? intl`Checking for update...`
                : debugStore.isUpdateAvailable
                ? intl`A new version is available: ${nv}`
                : intl`Brekeke Phone is up-to-date, checked ${ago}`}
            </Text>
          </React.Fragment>
        )}
      </Layout>
    );
  }
}

export default PageSettingsDebug;
