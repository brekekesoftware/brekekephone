import { BackHandler } from '../native/Rn';
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

// Handle android hardware back button press
BackHandler.addEventListener(`hardwareBackPress`, () => {
  if ($.currentPicker) {
    $.dismissPicker();
    return true;
  }
  return false;
});
