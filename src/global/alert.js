import React, { createContext, useContext, useState } from 'react';

const AlertContext = createContext();

export const AlertProvider = props => {
  // prompt?:
  //    title: string|ReactElement
  //    message: string|ReactElement
  //    onConfirm?: Function
  //    onDismiss?: Function
  // error?:
  //    message: string|ReactElement
  //    err: Error
  //    unexpectedErr?: Error
  // loading?: boolean
  const [alerts, setAlerts] = useState([]);
  return (
    <AlertContext.Provider
      {...props}
      value={{
        alerts,
        showPrompt: prompt => {
          setAlerts([...alerts, { prompt }]);
        },
        showError: error => {
          setAlerts([...alerts, { error }]);
        },
        showLoading: loading => {
          loading = loading || true;
          setAlerts([...alerts, { loading }]);
        },
        dismissAlert: () => {
          const [, ...remainingAlerts] = alerts;
          setAlerts(remainingAlerts);
        },
      }}
    />
  );
};

export const useAlert = () => useContext(AlertContext);

// Handle android hardware back button press
// BackHandler.addEventListener(`hardwareBackPress`, () => {
//   if ($.alerts.length) {
//     $.dismissAlert();
//     return true;
//   }
//   return false;
// });
