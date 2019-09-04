import React from 'react';
import { FlatList, StyleSheet } from 'react-native';

import AppHeader from '../shared/AppHeader';
import LinearGradient from '../shared/LinearGradient';
import v from '../style/variables';
import SigninProfileItem, { NoServer } from './SigninProfileItem';

const s = StyleSheet.create({
  PageSigninUI: {
    flex: 1,
  },
  ListServer: {
    marginBottom: 2 * v.padding,
    paddingTop: 3 * v.padding,
    paddingLeft: v.padding,
  },
});

const PageSigninUI = p => (
  <LinearGradient style={s.PageSigninUI} colors={[v.brekekeGreen, '#2a2a2a']}>
    <AppHeader
      text="Servers"
      subText={`${p.profileIds.length} SERVER${
        p.profileIds.length > 1 ? 'S' : ''
      } IN TOTAL`}
      onCreateBtnPress={p.create}
      createBtnGreen={false}
    />
    {!!p.profileIds.length && (
      <FlatList
        data={p.profileIds}
        horizontal
        style={s.ListServer}
        renderItem={({ index }) => (
          <SigninProfileItem
            {...p.resolveProfile(p.profileIds[index])}
            remove={p.remove}
            update={p.update}
            signin={p.signin}
            toggleModal={p.toggleModal}
          />
        )}
      />
    )}
    {!p.profileIds.length && <NoServer create={p.create} />}
  </LinearGradient>
);

export default PageSigninUI;
