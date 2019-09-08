import {
  mdiAlphaPCircleOutline,
  mdiCallSplit,
  mdiDialpad,
  mdiPauseCircleOutline,
  mdiPlayCircleOutline,
  mdiRecord,
  mdiRecordCircleOutline,
  mdiVideoOffOutline,
  mdiVideoOutline,
  mdiVolumeHigh,
  mdiVolumeMedium,
} from '@mdi/js';
import { Button, Left, Text, View } from 'native-base';
import React from 'react';
import { Platform } from 'react-native';

import SvgIcon from '../../shared/SvgIcon';

class CallBar extends React.Component {
  render() {
    const p = this.props;

    return (
      <View>
        <Left callBar>
          {p.answered && !p.holding && (
            <Left>
              <Button transparent dark bordered onPress={p.transfer}>
                <SvgIcon path={mdiCallSplit} />
              </Button>
              <Text>TRANSFER</Text>
            </Left>
          )}
          {p.answered && !p.holding && (
            <Left>
              <Button transparent dark bordered onPress={p.park}>
                <SvgIcon path={mdiAlphaPCircleOutline} />
              </Button>
              <Text>PARK</Text>
            </Left>
          )}
          {p.answered && !p.holding && !p.localVideoEnabled && (
            <Left>
              <Button transparent dark bordered onPress={p.enableVideo}>
                <SvgIcon path={mdiVideoOutline} />
              </Button>
              <Text>VIDEO</Text>
            </Left>
          )}
          {p.answered && !p.holding && p.localVideoEnabled && (
            <Left>
              <Button transparent dark bordered onPress={p.disableVideo}>
                <SvgIcon path={mdiVideoOffOutline} />
              </Button>
              <Text>VIDEO</Text>
            </Left>
          )}
          {p.answered && !p.holding && !p.loudspeaker && Platform.OS !== 'web' && (
            <Left>
              <Button transparent dark bordered onPress={p.onOpenLoudSpeaker}>
                <SvgIcon path={mdiVolumeHigh} />
              </Button>
              <Text>SPEAKER</Text>
            </Left>
          )}
          {p.answered && !p.holding && p.loudspeaker && Platform.OS !== 'web' && (
            <Left>
              <Button transparent dark bordered onPress={p.onCloseLoudSpeaker}>
                <SvgIcon path={mdiVolumeMedium} />
              </Button>
              <Text>SPEAKER</Text>
            </Left>
          )}
          {p.answered && p.holding && (
            <Left>
              <Button transparent dark bordered onPress={p.unhold}>
                <SvgIcon path={mdiPlayCircleOutline} />
              </Button>
              <Text>UNHOLD</Text>
            </Left>
          )}
        </Left>
        <Left callBar>
          {p.answered && !p.holding && !p.recording && (
            <Left>
              <Button transparent dark bordered onPress={p.startRecording}>
                <SvgIcon path={mdiRecordCircleOutline} />
              </Button>
              <Text>RECORDING</Text>
            </Left>
          )}
          {p.answered && !p.holding && p.recording && (
            <Left>
              <Button transparent dark bordered onPress={p.stopRecording}>
                <SvgIcon path={mdiRecord} />
              </Button>
              <Text>RECORDING</Text>
            </Left>
          )}
          {p.answered && !p.holding && (
            <Left>
              <Button transparent dark bordered onPress={p.dtmf}>
                <SvgIcon path={mdiDialpad} />
              </Button>
              <Text>KEYPAD</Text>
            </Left>
          )}
          {p.answered && !p.holding && (
            <Left>
              <Button transparent dark bordered onPress={p.hold}>
                <SvgIcon path={mdiPauseCircleOutline} />
              </Button>
              <Text>HOLD</Text>
            </Left>
          )}
        </Left>
      </View>
    );
  }
}

export default CallBar;
