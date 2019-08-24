import { mdiCheck, mdiClose } from '@mdi/js';
import {
  Body,
  Button,
  Content,
  Left,
  ListItem,
  Text,
  Thumbnail,
  View,
} from 'native-base';
import React from 'react';
import Progress from 'react-native-progress-circle';

import SvgIcon from '../components-shared/SvgIcon';
import { std } from '../styleguide';

const File = p => (
  <View>
    <View>
      <Text>{p.name}</Text>
      <Text>{p.size}</Text>
    </View>
    {p.transferWaiting && (
      <Button onPress={p.reject}>
        <SvgIcon path={mdiClose} />
      </Button>
    )}
    {p.incoming && p.transferWaiting && (
      <Button onPress={p.accept}>
        <SvgIcon path={mdiCheck} />
      </Button>
    )}
    {p.transferStarted && (
      <Button onPress={p.reject}>
        <Progress
          percent={p.transferPercent}
          radius={std.iconSize.md}
          borderWidth={StyleSheet.hairlineWidth * 2}
          color={std.color.notice}
          shadowColor={std.color.shade4}
          bgColor={std.color.shade0}
        >
          <SvgIcon path={mdiClose} />
        </Progress>
      </Button>
    )}
    {p.transferSuccess && <Text>Success</Text>}
    {p.transferFailure && <Text>Failed</Text>}
    {p.transferStopped && <Text>Canceled</Text>}
  </View>
);

const Chat = p => (
  <ListItem chat>
    <Left>
      <Thumbnail source={{ uri: p.creatorAvatar }} />
    </Left>
    <Body>
      <View>
        <Text>{p.creatorName}</Text>
        <Text note>{p.created}</Text>
      </View>
      {!!p.text && <Text numberOfLines={999}>{p.text}</Text>}
      {!!p.file && (
        <File
          {...p.file}
          accept={() => p.acceptFile(p.file)}
          reject={() => p.rejectFile(p.file)}
        />
      )}
    </Body>
  </ListItem>
);

class ChatMessages extends React.Component {
  render() {
    const p = this.props;
    return (
      <Content>
        {p.ids.map((id, index) => (
          <Chat
            key={id}
            {...p.resolve(id, index)}
            acceptFile={p.acceptFile}
            rejectFile={p.rejectFile}
          />
        ))}
      </Content>
    );
  }
}

export default ChatMessages;
