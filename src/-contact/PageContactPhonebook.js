import { mdiInformation, mdiPhone } from '@mdi/js';
import debounce from 'lodash/debounce';
import orderBy from 'lodash/orderBy';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import g from '../global';
import contactStore from '../global/contactStore';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from '../native/Rn';
import Field from '../shared/Field';
import Layout from '../shared/Layout';
import { arrToMap } from '../utils/toMap';
import v from '../variables';
import UserItem from './UserItem';

const numberOfContactsPerPage = 30;
const formatPhoneNumber = number => number.replace(/\D+/g, ``);

const s = StyleSheet.create({
  PhoneBook_BtnReload: {
    marginLeft: `auto`,
    marginRight: `auto`,
    backgroundColor: v.mainBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 5,
    marginTop: 5,
    borderRadius: 2,
    ...g.boxShadow,
  },
  PhoneBook_TxtReload: {
    color: v.revColor,
  },
});

@observer
class PageContactPhonebook extends React.Component {
  @computed get phoneBookId() {
    return contactStore.phoneBooks.map(p => p.id);
  }

  @computed get phoneBookById() {
    return arrToMap(contactStore.phoneBooks, `id`, p => p);
  }

  static contextTypes = {
    pbx: PropTypes.object.isRequired,
    sip: PropTypes.object.isRequired,
  };

  state = {
    loading: false,
    hidden: false,
  };

  componentDidMount() {
    const noPhonebook = !this.phoneBookId.length;
    if (noPhonebook) {
      this.loadContacts.flush();
      this.loadContacts();
    }
  }

  render() {
    const phonebooks = this.state.hidden
      ? this.phoneBookId.map(this.resolveChat).filter(i => i.hidden !== true)
      : this.phoneBookId.map(this.resolveChat);

    const map = {};

    phonebooks.forEach(u => {
      u.name = u.name || u.id;
      let c0 = u.name.charAt(0).toUpperCase();
      if (!/[A-Z]/.test(c0)) {
        c0 = `#`;
      }
      if (!map[c0]) {
        map[c0] = [];
      }
      map[c0].push(u);
    });

    let groups = Object.keys(map).map(k => ({
      key: k,
      phonebooks: map[k],
    }));
    groups = orderBy(groups, `key`);
    groups.forEach(g => {
      g.phonebooks = orderBy(g.phonebooks, `name`);
    });

    return (
      <Layout
        footer={{
          navigation: {
            menu: `contact`,
            subMenu: `phonebook`,
          },
        }}
        header={{
          title: this.props.book || `Phonebook`,
          description: `Your phonebook contacts`,
          onCreateBtnPress: this.create,
          navigation: {
            menu: `contact`,
            subMenu: `phonebook`,
          },
        }}
      >
        <Field
          label="SHOW SHARED CONTACTS"
          onValueChange={this.setHiddenContact}
          type={`Switch`}
          value={this.state.hidden}
        />
        {this.state.loading && (
          <View style={{ marginTop: 20 }}>
            <ActivityIndicator color={v.mainBg} size={1} />
          </View>
        )}
        {!this.state.loading && (
          <View>
            <TouchableOpacity
              onPress={() => {
                this.loadContacts.flush();
                this.loadContacts();
              }}
              style={s.PhoneBook_BtnReload}
            >
              <Text style={s.PhoneBook_TxtReload}>Reload</Text>
            </TouchableOpacity>
            {groups.map(_g => (
              <React.Fragment key={_g.key}>
                <Field isGroup label={_g.key} />
                {_g.phonebooks.map((u, i) => (
                  <UserItem
                    function={[
                      () =>
                        g.openPicker({
                          options: [
                            {
                              key: u.workNumber,
                              label: u.workNumber || `Please add work number`,
                              icon: mdiPhone,
                            },
                            {
                              key: u.cellNumber,
                              label: u.cellNumber || `Please add cell number`,
                              icon: mdiPhone,
                            },
                            {
                              key: u.homeNumber,
                              label: u.homeNumber || `Please add home number`,
                              icon: mdiPhone,
                            },
                          ],
                          onSelect: this.call,
                        }),
                      () => this.update(u),
                    ]}
                    icon={[mdiPhone, mdiInformation]}
                    key={i}
                    last={i === _g.phonebooks.length - 1}
                    name={u.name}
                  />
                ))}
              </React.Fragment>
            ))}
          </View>
        )}
      </Layout>
    );
  }

  setHiddenContact = value => {
    this.setState({
      hidden: value,
    });
  };

  setSearchText = searchText => {
    const oldQuery = this.props;
    const query = {
      ...oldQuery,
      searchText,
      offset: 0,
    };
    g.goToPageContactPhonebook(query);
    this.loadContacts.flush();
    this.loadContacts();
  };

  resolveChat = id => {
    const phonebook = this.phoneBookById[id];
    if (phonebook) {
      return {
        name: `${phonebook.firstName} ${phonebook.lastName}`,
        ...phonebook,
      };
    }
  };

  loadContacts = debounce(() => {
    const { pbx } = this.context;
    const query = this.props;
    const book = query.book;
    const shared = true;
    const opts = {
      limit: numberOfContactsPerPage,
      offset: query.offset,
      searchText: query.searchText,
    };
    this.setState({
      loading: true,
    });
    pbx
      .getContacts(book, shared, opts)
      .then(this.onLoadContactsSuccess)
      .catch(this.onLoadContactsFailure);
  }, 500);

  onLoadContactsSuccess = contacts => {
    this.setState({
      loading: false,
    });
    contacts.map(c => this.loadContactDetail(c.id));
  };

  onLoadContactsFailure = err => {
    this.setState({
      loading: false,
    });
    g.showError({ message: `load contact list`, err });
  };

  loadContactDetail = id => {
    const { pbx } = this.context;
    pbx
      .getContact(id)
      .then(detail => {
        contactStore.pushPhonebook(detail);
      })
      .catch(err => {
        g.showError({ message: `load contact detail for id ${id}`, err });
      });
  };

  goNextPage = () => {
    const oldQuery = this.props;

    const query = {
      ...oldQuery,
      offset: oldQuery.offset + numberOfContactsPerPage,
    };

    g.goToPageContactPhonebook(query);

    setTimeout(() => {
      this.loadContacts.flush();
      this.loadContacts();
    }, 170);
  };

  goPrevPage = () => {
    const oldQuery = this.props;
    const query = {
      ...oldQuery,
      offset: oldQuery.offset - numberOfContactsPerPage,
    };
    g.goToPageContactPhonebook(query);
    setTimeout(() => {
      this.loadContacts.flush();
      this.loadContacts();
    }, 170);
  };

  call = number => {
    const { sip } = this.context;
    number = formatPhoneNumber(number);
    sip.createSession(number);
    g.goToPageCallManage();
  };

  create = () => {
    g.goToPagePhonebookCreate({
      book: this.props.book,
    });
  };
  update = contact => {
    g.goToPagePhonebookUpdate({
      contact: contact,
    });
  };
}

export default PageContactPhonebook;
