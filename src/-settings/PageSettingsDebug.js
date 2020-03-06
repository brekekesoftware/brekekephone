import { mdiKeyboardBackspace } from '@mdi/js';
import filesize from 'filesize';
import { observer } from 'mobx-react';
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
    return (
      <Layout
        description={intl`App information and debugging`}
        dropdown={[
          ...(Platform.OS !== `web`
            ? [
                {
                  label: intl`Clear all log files`,
                  onPress: () => {
                    /* TODO */
                  },
                  danger: true,
                },
                {
                  label: intl`Manually check for update`,
                  onPress: () => {
                    /* TODO */
                  },
                },
              ]
            : []),
        ]}
        onBack={g.backToPageProfileSignIn}
        title={intl`Debug`}
      >
        {Platform.OS !== `web` && (
          <React.Fragment>
            <Field isGroup label={intl`DEBUG LOG`} />
            <Field
              label={intl`CAPTURE ALL DEBUG LOG`}
              onValueChange={debugStore.setF(`captureDebugLog`)}
              type="Switch"
              value={debugStore.captureDebugLog}
            />
            <Field
              createBtnIcon={mdiKeyboardBackspace}
              createBtnIconStyle={css.BtnIcon}
              label={intl`SAVE LOG TO FILE`}
              onCreateBtnPress={() => {
                /* TODO */
              }}
              onTouchPress={() => {
                /* TODO */
              }}
              value={filesize(debugStore.logSize, { round: 0 })}
            />

            <Field hasMargin isGroup label={intl`UPDATE`} />
            <Field
              createBtnIcon={mdiKeyboardBackspace}
              createBtnIconStyle={css.BtnIcon}
              label={intl`UPDATE`}
              onCreateBtnPress={() => {
                /* TODO */
              }}
              onTouchPress={() => {
                /* TODO */
              }}
              value={intl`Open Brekeke Phone on store`}
            />
            <Text normal small style={css.Text} warning>
              {intl`Current version: 2.0.0`}
            </Text>
            <Text normal small style={css.Text} warning>
              {intl`Checking for update...`}
            </Text>
            <Text normal small style={css.Text} warning>
              {intl`New version is available to update`}
            </Text>
            <Text normal primary small style={css.Text}>
              {intl`Brekeke Phone is up-to-update (checked 4m ago)`}
            </Text>
          </React.Fragment>
        )}
      </Layout>
    );
  }
}

export default PageSettingsDebug;
