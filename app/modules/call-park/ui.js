import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity as Button,
  Text,
} from 'react-native';
import { std } from '../styleguide';

const st = StyleSheet.create({
  fullpage: {
    flex: 1,
    backgroundColor: std.color.shade3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullpageMessage: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    color: std.color.shade5,
    lineHeight: std.textSize.md + std.gap.md * 2,
  },
  main: {
    flex: 1,
    backgroundColor: std.color.shade3,
  },
  navbar: {
    backgroundColor: std.color.shade1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: std.gap.sm,
    borderColor: std.color.shade4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navbarTitle: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.shade9,
  },
  navbarLeftOpt: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: std.gap.lg,
    top: 0,
    bottom: 0,
    paddingRight: std.gap.lg,
  },
  navbarRightOpt: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: std.gap.lg,
    top: 0,
    bottom: 0,
    paddingLeft: std.gap.lg,
  },
  navbarOptText: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.action,
  },
  divider: {
    paddingLeft: std.gap.lg,
    paddingTop: std.gap.lg * 2,
    paddingBottom: std.gap.lg,
    borderColor: std.color.shade4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dividerTitle: {
    fontFamily: std.font.text,
    fontSize: std.textSize.sm,
    color: std.color.shade5,
  },
  call: {
    padding: std.gap.lg,
    backgroundColor: std.color.shade0,
  },
  partyName: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.shade9,
  },
  partyNumber: {
    fontFamily: std.font.text,
    fontSize: std.textSize.sm,
    lineHeight: std.textSize.sm + std.gap.sm * 2,
    color: std.color.shade5,
  },
  parks: {
    flex: 1,
  },
  park: {
    backgroundColor: std.color.shade0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: std.gap.lg,
    borderColor: std.color.shade4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  parkSelected: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth * 5,
    backgroundColor: std.color.active,
  },
  parkText: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.shade9,
    flex: 1,
  },
});

const Call = p => (
  <View style={st.call}>
    <Text style={st.partyName}>{p.partyName || 'Unnamed'}</Text>
    <Text style={st.partyNumber}>{p.partyNumber}</Text>
  </View>
);

const Divider = ({ children }) => (
  <View style={st.divider}>
    <Text style={st.dividerTitle}>{children}</Text>
  </View>
);

const Park = p => (
  <Button style={st.park} onPress={p.select}>
    {p.selected && <View style={st.parkSelected} />}
    <Text style={st.parkText}>{p.id}</Text>
  </Button>
);

const Parks = p => (
  <ScrollView style={st.parks}>
    {p.ids.map(id => (
      <Park
        key={id}
        id={id}
        selected={id === p.selectedId}
        select={() => p.select(id)}
      />
    ))}
  </ScrollView>
);

const Main = p => (
  <View style={st.main}>
    <View style={st.navbar}>
      <Button style={st.navbarLeftOpt} onPress={p.back}>
        <Text style={st.navbarOptText}>Back</Text>
      </Button>
      <Text style={st.navbarTitle}>Parking Call</Text>
      <Button style={st.navbarRightOpt} onPress={p.park}>
        <Text style={st.navbarOptText}>Park</Text>
      </Button>
    </View>
    <Divider>CALL</Divider>
    <Call {...p.call} />
    <Divider>AT</Divider>
    <Parks ids={p.parks} selectedId={p.selectedPark} select={p.selectPark} />
  </View>
);

const NoCall = p => (
  <View style={st.main}>
    <View style={st.navbar}>
      <Button style={st.navbarLeftOpt} onPress={p.back}>
        <Text style={st.navbarOptText}>Back</Text>
      </Button>
      <Text style={st.navbarTitle}>Parking Call</Text>
    </View>
    <View style={st.fullpage}>
      <Text style={st.fullpageMessage}>The call is no longer available</Text>
    </View>
  </View>
);

const NoPark = p => (
  <View style={st.main}>
    <View style={st.navbar}>
      <Button style={st.navbarLeftOpt} onPress={p.back}>
        <Text style={st.navbarOptText}>Back</Text>
      </Button>
      <Text style={st.navbarTitle}>Parking Call</Text>
    </View>
    <View style={st.fullpage}>
      <Text style={st.fullpageMessage}>No setup park number</Text>
    </View>
  </View>
);

const CallPark = p =>
  !p.call ? (
    <NoCall back={p.back} />
  ) : !p.parks.length ? (
    <NoPark back={p.back} />
  ) : (
    <Main {...p} />
  );

export default CallPark;
