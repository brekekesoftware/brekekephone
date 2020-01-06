import './__alert';
import './__keyboard';
import './__picker';
import './__stacker';
import './_profiles';

import { BackHandler, Keyboard } from '../-/Rn';
import v from '../variables';
import g from './_';

g.extends(v);

// Handle android hardware back button press
BackHandler.addEventListener(`hardwareBackPress`, () => {
  if (g.isKeyboardShowing) {
    Keyboard.dismiss();
    return true;
  }
  if (g.alerts.length) {
    g.dismissAlert();
    return true;
  }
  if (g.currentPicker) {
    g.dismissPicker();
    return true;
  }
  if (g.stacks.length > 1) {
    g.stacks.pop();
    return true;
  }
  return false;
});

export default g;
