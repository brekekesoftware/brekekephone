import { mdiChevronRight } from '@mdi/js';
import PropTypes from 'prop-types';
import React from 'react';

import g from '../global';
import { TouchableOpacity } from '../native/Rn';
import Item from '../shared/ItemUser';
import Layout from '../shared/Layout';

class PagePhoneBook extends React.Component {
  static contextTypes = {
    pbx: PropTypes.object.isRequired,
  };

  state = {
    loading: true,
    books: [],
  };

  componentDidMount() {
    this.loadBooks();
  }

  render() {
    const { books } = this.state;
    return (
      <Layout
        header={{
          title: `Phone Book`,
          onCreateBtnPress: g.goToContactsCreate,
        }}
        footer={{}}
      >
        <React.Fragment>
          {books.map((book, i) => (
            <TouchableOpacity
              onPress={() =>
                g.goToContactsBrowse({
                  book: book.name,
                  shared: book.shared,
                })
              }
            >
              <Item
                last={i === books.length - 1}
                name={book.name}
                icon={[mdiChevronRight]}
              />
            </TouchableOpacity>
          ))}
        </React.Fragment>
      </Layout>
    );
  }

  loadBooks() {
    const { pbx } = this.context;

    this.setState({
      loading: true,
    });

    pbx
      .getPhonebooks()
      .then(this.onLoadSuccess)
      .catch(this.onLoadFailure);
  }

  onLoadSuccess = books => {
    this.setState({
      books,
      loading: false,
    });
  };

  onLoadFailure = function(err) {
    console.error(err);
    g.showError(err.message);
  };
}

export default PagePhoneBook;
