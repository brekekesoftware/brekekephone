import { Linking } from 'react-native';

import parse from './deeplink-parse';

export const getUrlParams = () => Linking.getInitialURL().then(parse);
