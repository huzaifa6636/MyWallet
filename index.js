/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import AppStack from './src/navigation/AppStack';

AppRegistry.registerComponent(appName, () => AppStack);
