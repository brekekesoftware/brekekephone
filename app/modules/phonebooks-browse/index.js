import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createModelView } from 'redux-model';
import createID from 'shortid';
import UI from './ui';

const mapAction = action => emit => ({
  routeToContactsBrowse(book) {
    emit(
      action.router.goToContactsBrowse({
        book: book.name,
        shared: book.shared,
      }),
    );
  },
  routeToContactsCreate() {
    emit(action.router.goToContactsCreate());
  },
  showToast(message) {
    emit(action.toasts.create({ id: createID(), message }));
  },
});

class View extends Component {
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

  render = () => (
    <UI
      loading={this.state.loading}
      books={this.state.books}
      selectBook={this.props.routeToContactsBrowse}
      create={this.props.routeToContactsCreate}
    />
  );

  loadBooks() {
    const { pbx } = this.context;

    this.setState({ loading: true });

    pbx
      .getPhonebooks()
      .then(this.onLoadSuccess)
      .catch(this.onLoadFailure);
  }

  onLoadSuccess = books => {
    this.setState({ books, loading: false });
  };

  onLoadFailure = function(err) {
    console.error(err);
    err && this.props.showToast(err.message);
  };
}

export default createModelView(null, mapAction)(View);
