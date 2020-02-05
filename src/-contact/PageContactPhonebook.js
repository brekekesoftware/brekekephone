import {
  mdiBriefcase,
  mdiCellphone,
  mdiHome,
  mdiInformation,
  mdiPhone,
} from '@mdi/js';
import debounce from 'lodash/debounce';
import orderBy from 'lodash/orderBy';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

import { ActivityIndicator, View } from '../-/Rn';
import pbx from '../api/pbx';
import sip from '../api/sip';
import g from '../global';
import authStore from '../global/authStore';
import contactStore from '../global/contactStore';
import Field from '../shared/Field';
import Layout from '../shared/Layout';
import { arrToMap } from '../utils/toMap';
import UserItem from './UserItem';

const numberOfContactsPerPage = 30;
const formatPhoneNumber = number => number.replace(/\D+/g, ``);

@observer
class PageContactPhonebook extends React.Component {
  @computed get phoneBookId() {
    return contactStore.phoneBooks.map(p => p.id);
  }
  @computed get phoneBookById() {
    return arrToMap(contactStore.phoneBooks, `id`, p => p);
  }
  state = {
    loading: false,
  };
  componentDidMount() {
    const id = setInterval(() => {
      if (!pbx.client) {
        return;
      }
      this.loadContacts.flush();
      this.loadContacts();
      clearInterval(id);
    }, 300);
  }
  render() {
    console.log(this);
    let phonebooks = this.phoneBookId.map(this.resolvePhonebook);
    if (!authStore.currentProfile.displaySharedContacts) {
      phonebooks = phonebooks.filter(i => i.shared !== true);
    }
    const map = {};
    phonebooks.forEach(u => {
      u.name = u.name || u.id || ``;
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
        description="Your phonebook contacts"
        dropdown={[
          {
            label: `Create new contact`,
            onPress: this.create,
          },
          {
            label: `Reload`,
            onPress: () => {
              this.loadContacts.flush();
              this.loadContacts();
            },
          },
        ]}
        menu="contact"
        subMenu="phonebook"
        title={this.props.book || `Phonebook`}
      >
        <Field
          label="SHOW SHARED CONTACTS"
          onValueChange={v => {
            g.upsertProfile({
              id: authStore.currentProfile.id,
              displaySharedContacts: v,
            });
          }}
          type={`Switch`}
          value={authStore.currentProfile.displaySharedContacts}
        />
        {this.state.loading && (
          <View style={{ marginTop: 20 }}>
            <ActivityIndicator color={g.colors.primary} size={1} />
          </View>
        )}
        {!this.state.loading && (
          <View>
            {groups.map(_g => (
              <React.Fragment key={_g.key}>
                <Field isGroup label={_g.key} />
                {_g.phonebooks.map((u, i) => (
                  <UserItem
                    iconFuncs={[
                      () =>
                        !u.homeNumber && !u.workNumber && !u.cellNumber
                          ? this.callRequest(``, u)
                          : this.renderPhoneBookNumer(u).length === 1
                          ? this.callRequest(
                              this.renderPhoneBookNumer(u)[0].value,
                              u,
                            )
                          : g.openPicker({
                              options: this.renderPhoneBookNumer(u).map(i => ({
                                key: i.value,
                                label: i.value,
                                icon: i.icon,
                              })),
                              onSelect: e => this.callRequest(e, u),
                            }),
                      () => this.update(u),
                    ]}
                    icons={[mdiPhone, mdiInformation]}
                    key={i}
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
  resolvePhonebook = id => {
    const phonebook = this.phoneBookById[id];
    if (phonebook) {
      return {
        name: `${phonebook.firstName} ${phonebook.lastName}`,
        ...phonebook,
      };
    }
  };
  loadContacts = debounce(() => {
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
    contactStore.phoneBooks = [];
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
    g.showError({ message: `Failed to load contact list`, err });
  };
  loadContactDetail = id => {
    pbx
      .getContact(id)
      .then(detail => {
        contactStore.pushPhonebook(detail);
      })
      .catch(err => {
        g.showError({
          message: `Failed to load contact detail for id ${id}`,
          err,
        });
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
  callRequest = (number, contact) => {
    if (number !== ``) {
      this.call(number);
    } else {
      this.update(contact);
      g.showError({ message: `This contact doesn't have any phone number` });
    }
  };
  renderPhoneBookNumer = contact => {
    const arrNumberExist = [];
    if (contact.workNumber !== ``) {
      arrNumberExist.push({
        key: `workNumber`,
        value: contact.workNumber,
        icon: mdiBriefcase,
      });
    }
    if (contact.cellNumber !== ``) {
      arrNumberExist.push({
        key: `cellNumber`,
        value: contact.cellNumber,
        icon: mdiCellphone,
      });
    }
    if (contact.homeNumber !== ``) {
      arrNumberExist.push({
        key: `homeNumber`,
        value: contact.homeNumber,
        icon: mdiHome,
      });
    }
    return arrNumberExist;
  };
}

export default PageContactPhonebook;
