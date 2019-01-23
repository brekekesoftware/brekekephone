import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createModelView } from '@thenewvu/redux-model';
import immutable from '@thenewvu/immutable';
import createID from 'shortid';
import debounce from 'debounce';
import UI from './ui';

const mapGetter = getter => state => ({
  query: getter.router.getQuery(state),
});

const mapAction = action => emit => ({
  routeToPhonebooksBrowse() {
    emit(action.router.goToPhonebooksBrowse());
  },
  routeToContactsBrowse(query) {
    emit(action.router.goToContactsBrowse(query));
  },
  routeToContactsCreate(query) {
    emit(action.router.goToContactsCreate(query));
  },
  showToast(message) {
    emit(action.toasts.create({ id: createID(), message }));
  },
});

const numberOfContactsPerPage = 30;

const formatPhoneNumber = number => number.replace(/\D+/g, '');

class View extends Component {
  static contextTypes = {
    pbx: PropTypes.object.isRequired,
    sip: PropTypes.object.isRequired,
  };

  static defaultProps = {
    query: {},
  };

  state = {
    query: {
      book: this.props.query.book,
      offset: parseInt(this.props.query.offset || 0),
      shared: this.props.query.shared === 'true',
      searchText: this.props.query.searchText || '',
    },
    loading: true,
    contactIds: [],
    contactById: {},
  };

  componentDidMount() {
    this.loadContacts();
    this.loadContacts.flush();
  }

  render = () => (
    <UI
      hasPrevPage={this.state.query.offset >= numberOfContactsPerPage}
      hasNextPage={this.state.contactIds.length === numberOfContactsPerPage}
      searchText={this.state.query.searchText}
      loading={this.state.loading}
      contactIds={this.state.contactIds}
      resolveContact={this.resolveContact}
      book={this.props.query.book}
      shared={this.props.query.shared === 'true'}
      back={this.props.routeToPhonebooksBrowse}
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

  resolveContact = id => this.state.contactById[id];

  setSearchText = searchText => {
    const oldQuery = this.state.query;
    const query = { ...oldQuery, searchText, offset: 0 };
    this.props.routeToContactsBrowse(query);
    this.setState({ query }, this.loadContacts);
  };

  editContact = id => {
    this.setState(
      immutable.on(this.state)(
        immutable.vset(`contactById.${id}.editing`, true),
      ),
    );
  };

  saveContact = id => {
    const contact = this.state.contactById[id];
    if (!contact.firstName) {
      this.props.showToast('The first name is required');
      return;
    }
    if (!contact.lastName) {
      this.props.showToast('The last name is required');
      return;
    }

    const { pbx } = this.context;
    this.setState(
      immutable.on(this.state)(
        immutable.vset(`contactById.${id}.loading`, true),
      ),
    );

    const onSuccess = () => {
      this.setState(
        immutable.on(this.state)(
          immutable.vset(`contactById.${id}.loading`, false),
          immutable.vset(`contactById.${id}.editing`, false),
        ),
      );
    };

    const onFailure = err => {
      this.setState(
        immutable.on(this.state)(
          immutable.vset(`contactById.${id}.loading`, false),
        ),
      );

      console.error(err);
      this.props.showToast('Failed to save the contact');
    };

    pbx.setContact(this.state.contactById[id]).then(onSuccess, onFailure);
  };

  setContactFirstName = (id, val) => {
    this.setState(
      immutable.on(this.state)(
        immutable.vset(`contactById.${id}.firstName`, val),
        immutable.vset(
          `contactById.${id}.name`,
          val + ' ' + this.state.contactById[id].lastName,
        ),
      ),
    );
  };

  setContactLastName = (id, val) => {
    this.setState(
      immutable.on(this.state)(
        immutable.vset(`contactById.${id}.lastName`, val),
        immutable.vset(
          `contactById.${id}.name`,
          this.state.contactById[id].firstName + ' ' + val,
        ),
      ),
    );
  };

  setContactJob = (id, val) => {
    this.setState(
      immutable.on(this.state)(immutable.vset(`contactById.${id}.job`, val)),
    );
  };

  setContactCompany = (id, val) => {
    this.setState(
      immutable.on(this.state)(
        immutable.vset(`contactById.${id}.company`, val),
      ),
    );
  };

  setContactAddress = (id, val) => {
    this.setState(
      immutable.on(this.state)(
        immutable.vset(`contactById.${id}.address`, val),
      ),
    );
  };

  setContactWorkNumber = (id, val) => {
    this.setState(
      immutable.on(this.state)(
        immutable.vset(`contactById.${id}.workNumber`, val),
      ),
    );
  };

  setContactCellNumber = (id, val) => {
    this.setState(
      immutable.on(this.state)(
        immutable.vset(`contactById.${id}.cellNumber`, val),
      ),
    );
  };

  setContactHomeNumber = (id, val) => {
    this.setState(
      immutable.on(this.state)(
        immutable.vset(`contactById.${id}.homeNumber`, val),
      ),
    );
  };

  setContactEmail = (id, val) => {
    this.setState(
      immutable.on(this.state)(immutable.vset(`contactById.${id}.email`, val)),
    );
  };

  loadContacts = debounce(() => {
    const { pbx } = this.context;
    const { query } = this.state;
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
      { contactIds, contactById, loading: false },
      this.loadContactDetails,
    );
  };

  onLoadContactsFailure = err => {
    console.error(err);
    this.props.showToast('Failed to load contacts');
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
    const oldQuery = this.state.query;
    const query = {
      ...oldQuery,
      offset: oldQuery.offset + numberOfContactsPerPage,
    };
    this.props.routeToContactsBrowse(query);
    this.setState({ query }, () => {
      this.loadContacts();
      this.loadContacts.flush();
    });
  };

  goPrevPage = () => {
    const oldQuery = this.state.query;
    const query = {
      ...oldQuery,
      offset: oldQuery.offset - numberOfContactsPerPage,
    };
    this.props.routeToContactsBrowse(query);
    this.setState({ query }, () => {
      this.loadContacts();
      this.loadContacts.flush();
    });
  };

  call = number => {
    const { sip } = this.context;
    number = formatPhoneNumber(number);
    sip.createSession(number);
  };

  create = () => {
    this.props.routeToContactsCreate({
      book: this.state.query.book,
    });
  };
}

export default createModelView(mapGetter, mapAction)(View);
