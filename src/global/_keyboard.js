import { Keyboard } from '../native/Rn';
import g from './_';

Object.assign(g, {
  isKeyboardShowing: false,
  waitKeyboard: fn => (...args) => {
    if (!g.isKeyboardShowing) {
      return fn(...args);
    }
    Keyboard.dismiss();
    setTimeout(() => fn(...args), 300);
  },
});

Keyboard.addListener('keyboardWillShow', () => {
  g.isKeyboardShowing = true;
});
Keyboard.addListener('keyboardWillHide', () => {
  g.isKeyboardShowing = false;
});
