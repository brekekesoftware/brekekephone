import React from 'react';
import { Platform } from 'react-native';
import codePush from 'react-native-code-push';
import App from './index';
import isWakeupByPush from './push-notification/isWakeupByPush';

// Staging keys:
const CODEPUSH_DEPLOYMENT_KEY = Platform.OS === 'ios'
  ? 'KSjV3ZwUrK1lmgMOH_XGYj_qAovk887dddad-fc48-4390-a39d-5f011e36c097'
  : 'INA8bgEBKIzZAuEEVUE5h3DTJ4pG887dddad-fc48-4390-a39d-5f011e36c097';

// Production keys:
// const CODEPUSH_DEPLOYMENT_KEY = Platform.OS === 'ios'
//   ? '_F4ZF-oRzz2KGC4r8yqbT09nW0kG887dddad-fc48-4390-a39d-5f011e36c097'
//   : 'KSjV3ZwUrK1lmgMOH_XGYj_qAovk887dddad-fc48-4390-a39d-5f011e36c097';

class CodePushApp extends React.Component {
  componentDidMount() {
    if (isWakeupByPush()) {
      // Not sync code push if it's from push notification
      return;
    }
    codePush.sync({
      deploymentKey: CODEPUSH_DEPLOYMENT_KEY,
      installMode: codePush.InstallMode.IMMEDIATE,
      updateDialog: true,
    });
  }
  render() {
    return <App />;
  }
}

export default CodePushApp;
