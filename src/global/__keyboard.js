import { Keyboard } from '../native/Rn';
import $ from './_';

$.extends({
  isKeyboardShowing: false,
  waitKeyboardTimeoutId: 0,
  waitKeyboard: fn => (...args) => {
    if ($.waitKeyboardTimeoutId) {
      return;
    }
    if (!$.isKeyboardShowing) {
      fn(...args);
      return;
    }
    Keyboard.dismiss();
    $.waitKeyboardTimeoutId = setTimeout(() => {
      $.waitKeyboardTimeoutId = 0;
      fn(...args);
    }, 300);
  },
});

const onKeyboardShow = () => {
  $.isKeyboardShowing = true;
};
const onKeyboardHide = () => {
  $.isKeyboardShowing = false;
};

Keyboard.addListener(`keyboardWillShow`, onKeyboardShow);
Keyboard.addListener(`keyboardWillHide`, onKeyboardHide);
Keyboard.addListener(`keyboardDidShow`, onKeyboardShow); // android
Keyboard.addListener(`keyboardDidHide`, onKeyboardHide); // android
