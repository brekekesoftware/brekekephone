import debounce from 'lodash/debounce';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import g from '../global';
import Layout from '../shared/Layout';
import ContactItem from './contactItem';

const numberOfContactsPerPage = 30;
const formatPhoneNumber = number => number.replace(/\D+/g, ``);

@observer
class PageContactPhoneBook extends React.Component {
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
    const { contactIds } = this.state;
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
          onCreateBtnPress: this.create,
        }}
      >
        {contactIds.map(id => (
          <ContactItem {...this.resolveContact(id)} update={this.update} />
        ))}
      </Layout>
    );
  }

  resolveContact = id => this.state.contactById[id];

  setSearchText = searchText => {
    const oldQuery = this.props;
    const query = {
      ...oldQuery,
      searchText,
      offset: 0,
    };
    g.goToContactsBrowse(query);
    this.loadContacts.flush();
    this.loadContacts();
  };

  loadContacts = debounce(() => {
    const { pbx } = this.context;
    const query = this.props;
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
      .then(contacts => {
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
      })
      .catch(err => {
        g.showError({ message: `load contact list`, err });
      });
  }, 500);

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
        g.showError({ message: `load contact detail for id ${id}`, err });
      });
  };

  goNextPage = () => {
    const oldQuery = this.props;

    const query = {
      ...oldQuery,
      offset: oldQuery.offset + numberOfContactsPerPage,
    };

    g.goToContactsBrowse(query);

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
    g.goToContactsBrowse(query);
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
    g.goToContactsCreate({
      book: this.props.book,
    });
  };
  update = contact => {
    g.goToContactsUpdate({
      contact: contact,
    });
  };
}

export default PageContactPhoneBook;
