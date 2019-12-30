import $ from './_';

$.extends({
  observable: {
    // options: []
    //     key: string
    //     label: string
    //     icon?: MdiIcon
    // cancelLabel?: string
    // selectedKey?: string
    // onSelect: Function
    currentPicker: null,
  },
  openPicker: picker => {
    $.set(`currentPicker`, picker);
  },
  dismissPicker: () => {
    $.set(`currentPicker`, null);
  },
});
