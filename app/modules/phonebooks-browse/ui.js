import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity as Button,
  Text,
  ActivityIndicator,
} from 'react-native';
import { std } from '../styleguide';

const st = StyleSheet.create({
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMessage: {
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
  navbarRightAction: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: std.gap.lg,
    top: 0,
    bottom: 0,
    paddingLeft: std.gap.lg,
  },
  navbarActionText: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.action,
  },
  books: {
    flex: 1,
  },
  book: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: std.gap.lg,
    paddingRight: std.gap.sm,
    paddingVertical: std.gap.lg,
    backgroundColor: std.color.shade0,
    borderColor: std.color.shade4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  bookName: {
    flex: 1,
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.shade9,
  },
  bookChevron: {
    fontFamily: std.font.icon,
    fontSize: std.iconSize.md,
    color: std.color.action,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const Navbar = p => (
  <View style={st.navbar}>
    <Text style={st.navbarTitle}>Phonebooks</Text>
    <Button style={st.navbarRightAction} onPress={p.create}>
      <Text style={st.navbarActionText}>Create</Text>
    </Button>
  </View>
);

const Book = p => (
  <Button style={st.book} onPress={p.select}>
    <Text style={st.bookName}>
      {p.name} {p.shared && '(Shared)'}
    </Text>
    <Text style={st.bookChevron}>icon_chevron_right</Text>
  </Button>
);

const Books = p => (
  <ScrollView style={st.books}>
    {p.books.map((book, i) => (
      <Book key={i} {...book} select={() => p.select(book)} />
    ))}
  </ScrollView>
);

const Empty = p => (
  <View style={st.empty}>
    <Text style={st.emptyMessage}>Empty</Text>
  </View>
);

const Loading = () => (
  <View style={st.loading}>
    <ActivityIndicator />
  </View>
);

const PhonebooksBrowse = p => (
  <View style={st.main}>
    <Navbar create={p.create} />
    {p.books.length ? (
      <Books books={p.books} select={p.selectBook} />
    ) : p.loading ? (
      <Loading />
    ) : (
      <Empty />
    )}
  </View>
);

export default PhonebooksBrowse;
