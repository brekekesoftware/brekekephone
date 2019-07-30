import React from 'react';
import { Footer, FooterTab, Button, View, Icon, Form, Item, Input, Label } from 'native-base';
import {StyleSheet} from 'react-native';
import variable from '../native-base-theme/variables/platform';
import { std } from '../styleguide';
import {KeyboardAvoidingView} from 'react-native';

const st = StyleSheet.create({
  footer:{
    flexDirection: 'row',
    backgroundColor: std.color.shade1,
    paddingBottom: 0,
    // alignItems:  'center',
    justifyContent: 'space-between' 

  },
  btnLeft:{
    marginLeft: variable.listItemPadding + 3,
  },
  conRight:{
    flex: 1,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginRight: variable.listItemPadding + 3
  },
  formChat:{
    width: '55%',
    paddingLeft: 5,
  }
})


class FooterChats extends React.Component {

  render() {
    return (
      <KeyboardAvoidingView behavior="padding">
          <View style={st.footer}>
            <View>
              <Button  style={st.btnLeft}  success>
              <Icon name="add" type="MaterialIcons"/>
            </Button>
            </View>
              <Form style={st.formChat}>
              <Input  placeholder='Message'/>
            </Form>
            <View style={st.conRight}>
              <Button dark  transparent>
                <Icon name="sentiment-very-satisfied" type="MaterialIcons"/>
              </Button>
              <Button   success>
                <Icon name="send" type="MaterialIcons"/>
              </Button> 
            </View>
          </View>
      </KeyboardAvoidingView>
    );
}
}

export default FooterChats;
