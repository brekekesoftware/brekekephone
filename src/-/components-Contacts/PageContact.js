import { mdiAccountPlusOutline } from '@mdi/js';
import {
  Container,
  Content,
  Fab,
  Tab,
  TabHeading,
  Tabs,
  Text,
} from 'native-base';
import React from 'react';

import SvgIcon from '../../shared/SvgIcon';
import Hearders from '../components-Home/Header';
import TabUsers from './TabUsers';

class PageContacts extends React.Component {
  render() {
    const p = this.props;
    return (
      <Container>
        <Hearders title="Contacts" />
        <Content>
          <Tabs>
            <Tab
              heading={
                <TabHeading>
                  <Text>USERS</Text>
                </TabHeading>
              }
            >
              <TabUsers {...p} />
            </Tab>
            <Tab
              heading={
                <TabHeading>
                  <Text>PHONEBOOK</Text>
                </TabHeading>
              }
            />
          </Tabs>
        </Content>

        <Fab
          active={p.activeFab}
          direction="up"
          containerStyle={{}}
          style={{ backgroundColor: '#74bf53' }}
          position="bottomRight"
        >
          <SvgIcon path={mdiAccountPlusOutline} />
        </Fab>
      </Container>
    );
  }
}

export default PageContacts;
