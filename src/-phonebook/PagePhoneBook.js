import { mdiChevronRight } from '@mdi/js';
import PropTypes from 'prop-types';
import React from 'react';

import g from '../global';
import { TouchableOpacity } from '../native/Rn';
import FieldGroup from '../shared/FieldGroup';
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
      <Layout>
        <FieldGroup>
          {books.map((book, i) => (
            <TouchableOpacity
              onPress={b =>
                g.goToContactsBrowse({
                  book: b.name,
                  shared: b.shared,
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
        </FieldGroup>
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
