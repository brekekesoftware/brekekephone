import React from 'react';
import { Footer, FooterTab, Button, View, Icon, Form, Item, Input, Label } from 'native-base';
import {StyleSheet} from 'react-native';
import variable from '../native-base-theme/variables/platform';
import { std } from '../styleguide';

const st = StyleSheet.create({
  // container:{
  //   marginTop: variable.listItemPadding + 6,
  // },
  // item: {
  //   flexDirection: 'row',
  //   alignSelf: 'center',
  //   alignItems: 'flex-start', 
  //   paddingVertical: variable.listItemPadding + 3,
  // },
  // listitem:{
  //   flexDirection: 'column' ,
  //   alignItems: 'flex-start',
  // },
  // leftAvatar:{
  //   marginLeft: variable.listItemPadding + 6,
  //   marginTop: variable.listItemPadding - 5 ,
  // },
  // name:{
  //   textAlign: 'left',
  // },
  // bodyTitle:{
  //   flexDirection: 'row',
  // },
  // body:{
  //   paddingLeft: variable.listItemPadding + 3,
  //   paddingRight: variable.listItemPadding + 6,
  // },
  footer:{
    flexDirection: 'row',

  },
})


class FooterChats extends React.Component {

  render() {
    return (
        <View style={{paddingBottom: 0}}>
          <View style={st.footer}>
            <Button vertical>
              <Icon name="add" type="MaterialIcons"/>
            </Button>
            <Form>
              <Item inlineLabel>
                <Label>Message</Label>
                <Input />
              </Item>
            </Form>
          <Button>
            <Icon name="sentiment-very-satisfied" type="MaterialIcons"/>
          </Button>
          <Button>
            <Icon name="send" type="MaterialIcons"/>
          </Button> 
          </View>

        </View>
    );
  }
}

export default FooterChats;
