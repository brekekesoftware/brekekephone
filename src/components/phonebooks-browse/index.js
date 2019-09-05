import PropTypes from 'prop-types';
import React from 'react';

import routerStore from '../../mobx/routerStore';
import toast from '../../shared/Toast';
import UI from './ui';

class View extends React.Component {
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
    return (
      <UI
        loading={this.state.loading}
        books={this.state.books}
        selectBook={b =>
          routerStore.goToContactsBrowse({
            book: b.name,
            shared: b.shared,
          })
        }
        create={() => routerStore.goToContactsCreate()}
      />
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
    err && toast.error(err.message);
  };
}

export default View;
