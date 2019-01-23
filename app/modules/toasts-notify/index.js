import React, { Component } from 'react';
import { createModelView } from '@thenewvu/redux-model';
import UI from './ui';

const TIMEOUT = 2000;

const mapGetter = getter => state => ({
  toastIds: getter.toasts.idsByOrder(state),
  toastById: getter.toasts.detailMapById(state),
});

const mapAction = action => emit => ({
  removeToast(id) {
    emit(action.toasts.remove(id));
  },
});

class View extends Component {
  timeouts = {};

  componentDidMount() {
    this.initTimeouts();
  }

  componentDidUpdate() {
    this.initTimeouts();
  }

  initTimeouts() {
    const { toastIds, removeToast } = this.props;
    toastIds.forEach(id => {
      if (!this.timeouts[id]) {
        this.timeouts[id] = setTimeout(() => {
          removeToast(id);
          delete this.timeouts[id];
        }, TIMEOUT);
      }
    });
  }

  render = () => (
    <UI toastIds={this.props.toastIds} resolveToast={this.resolveToast} />
  );

  resolveToast = toast => this.props.toastById[toast];
}

export default createModelView(mapGetter, mapAction)(View);
