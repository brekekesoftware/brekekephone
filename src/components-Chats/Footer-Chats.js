import { mdiEmoticonOutline, mdiPlay, mdiPlus } from '@mdi/js';
import { Body, Button, Footer, Form, Input, Left, Right } from 'native-base';
import React from 'react';

import SvgIcon from '../components-shared/SvgIcon';

class FooterChats extends React.Component {
  render() {
    const p = this.props;
    return (
      <Footer footerChat>
        <Left>
          <Button onPress={p.pickFile}>
            <SvgIcon path={mdiPlus} bgcolor="#74bf53" />
          </Button>
        </Left>
        <Body>
          <Form>
            <Input
              placeholder="Type your message"
              blurOnSubmit={false}
              value={p.text}
              onChangeText={p.setText}
              onSubmitEditing={p.submitText}
            />
          </Form>
        </Body>
        <Right>
          <Button>
            <SvgIcon path={mdiEmoticonOutline} />
          </Button>
          <Button>
            <SvgIcon path={mdiPlay} />
          </Button>
        </Right>
      </Footer>
    );
  }
}

export default FooterChats;
