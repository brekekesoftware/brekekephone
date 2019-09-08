import debounce from 'lodash/debounce';
import set from 'lodash/set';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import routerStore from '../../shared/routerStore';
import Toast from '../../shared/Toast';
import UI from './ui';

const numberOfContactsPerPage = 30;
const formatPhoneNumber = number => number.replace(/\D+/g, '');

@observer
class View extends React.Component {
  static contextTypes = {
    pbx: PropTypes.object.isRequired,
    sip: PropTypes.object.isRequired,
  };

  state = {
    loading: true,
    contactIds: [],
    contactById: {},
  };

  componentDidMount() {
    this.loadContacts.flush();
    this.loadContacts();
  }

  render() {
    return (
      <UI
        hasPrevPage={routerStore.getQuery().offset >= numberOfContactsPerPage}
        hasNextPage={this.state.contactIds.length === numberOfContactsPerPage}
        searchText={routerStore.getQuery().searchText}
        loading={this.state.loading}
        contactIds={this.state.contactIds}
        resolveContact={this.resolveContact}
        book={routerStore.getQuery().book}
        shared={routerStore.getQuery().shared === 'true'}
        back={routerStore.goToPhonebooksBrowse}
        goNextPage={this.goNextPage}
        goPrevPage={this.goPrevPage}
        setSearchText={this.setSearchText}
        call={this.call}
        editContact={this.editContact}
        saveContact={this.saveContact}
        setContactFirstName={this.setContactFirstName}
        setContactLastName={this.setContactLastName}
        setContactJob={this.setContactJob}
        setContactCompany={this.setContactCompany}
        setContactAddress={this.setContactAddress}
        setContactWorkNumber={this.setContactWorkNumber}
        setContactCellNumber={this.setContactCellNumber}
        setContactHomeNumber={this.setContactHomeNumber}
        setContactEmail={this.setContactEmail}
        create={this.create}
      />
    );
  }

  resolveContact = id => this.state.contactById[id];

  setSearchText = searchText => {
    const oldQuery = routerStore.getQuery();

    const query = {
      ...oldQuery,
      searchText,
      offset: 0,
    };

    routerStore.goToContactsBrowse(query);
    this.loadContacts.flush();
    this.loadContacts();
  };

  editContact = id => {
    set(this.state, `contactById.${id}.editing`, true);
    this.setState(this.state);
  };

  saveContact = id => {
    const contact = this.state.contactById[id];

    if (!contact.firstName) {
      Toast.error('The first name is required');
      return;
    }

    if (!contact.lastName) {
      Toast.error('The last name is required');
      return;
    }

    const { pbx } = this.context;

    set(this.state, `contactById.${id}.loading`, true);
    this.setState(this.state);

    const onSuccess = () => {
      set(this.state, `contactById.${id}.loading`, false);
      set(this.state, `contactById.${id}.editing`, false);
      this.setState(this.state);
    };

    const onFailure = err => {
      set(this.state, `contactById.${id}.loading`, false);
      this.setState(this.state);

      console.error(err);
      Toast.error('Failed to save the contact');
    };

    pbx.setContact(this.state.contactById[id]).then(onSuccess, onFailure);
  };

  setContactFirstName = (id, val) => {
    set(this.state, `contactById.${id}.firstName`, val);
    set(
      this.state,
      `contactById.${id}.name`,
      val + ' ' + this.state.contactById[id].lastName,
    );
    this.setState(this.state);
  };

  setContactLastName = (id, val) => {
    set(this.state, `contactById.${id}.lastName`, val);
    set(
      this.state,
      `contactById.${id}.name`,
      this.state.contactById[id].firstName + ' ' + val,
    );
    this.setState(this.state);
  };

  setContactJob = (id, val) => {
    set(this.state, `contactById.${id}.job`, val);
    this.setState(this.state);
  };

  setContactCompany = (id, val) => {
    set(this.state, `contactById.${id}.company`, val);
    this.setState(this.state);
  };

  setContactAddress = (id, val) => {
    set(this.state, `contactById.${id}.address`, val);
    this.setState(this.state);
  };

  setContactWorkNumber = (id, val) => {
    set(this.state, `contactById.${id}.workNumber`, val);
    this.setState(this.state);
  };

  setContactCellNumber = (id, val) => {
    set(this.state, `contactById.${id}.cellNumber`, val);
    this.setState(this.state);
  };

  setContactHomeNumber = (id, val) => {
    set(this.state, `contactById.${id}.homeNumber`, val);
    this.setState(this.state);
  };

  setContactEmail = (id, val) => {
    set(this.state, `contactById.${id}.email`, val);
    this.setState(this.state);
  };

  loadContacts = debounce(() => {
    const { pbx } = this.context;

    const query = routerStore.getQuery();
    const book = query.book;
    const shared = query.shared;

    const opts = {
      limit: numberOfContactsPerPage,
      offset: query.offset,
      searchText: query.searchText,
    };

    this.setState({
      loading: true,
      contactIds: [],
      contactById: [],
    });

    pbx
      .getContacts(book, shared, opts)
      .then(this.onLoadContactsSuccess)
      .catch(this.onLoadContactsFailure);
  }, 500);

  onLoadContactsSuccess = contacts => {
    const contactIds = [];
    const contactById = {};

    contacts.forEach(contact => {
      contactIds.push(contact.id);

      contactById[contact.id] = {
        ...contact,
        loading: true,
      };
    });

    this.setState(
      {
        contactIds,
        contactById,
        loading: false,
      },
      this.loadContactDetails,
    );
  };

  onLoadContactsFailure = err => {
    console.error(err);
    Toast.error('Failed to load contacts');
  };

  loadContactDetails = () => {
    const contactIds = this.state.contactIds;
    contactIds.map(this.loadContactDetail);
  };

  loadContactDetail = id => {
    const { pbx } = this.context;

    pbx
      .getContact(id)
      .then(detail => {
        this.setState(prevState => ({
          contactById: {
            ...prevState.contactById,

            [id]: {
              ...prevState.contactById[id],
              ...detail,
              loading: false,
            },
          },
        }));
      })
      .catch(err => {
        console.err(err);
      });
  };

  goNextPage = () => {
    const oldQuery = routerStore.getQuery();

    const query = {
      ...oldQuery,
      offset: oldQuery.offset + numberOfContactsPerPage,
    };

    routerStore.goToContactsBrowse(query);

    setTimeout(() => {
      this.loadContacts.flush();
      this.loadContacts();
    }, 170);
  };

  goPrevPage = () => {
    const oldQuery = routerStore.getQuery();

    const query = {
      ...oldQuery,
      offset: oldQuery.offset - numberOfContactsPerPage,
    };

    routerStore.goToContactsBrowse(query);

    setTimeout(() => {
      this.loadContacts.flush();
      this.loadContacts();
    }, 170);
  };

  call = number => {
    const { sip } = this.context;

    number = formatPhoneNumber(number);
    sip.createSession(number);
  };

  create = () => {
    routerStore.goToContactsCreate({
      book: routerStore.getQuery().book,
    });
  };
}

export default View;
