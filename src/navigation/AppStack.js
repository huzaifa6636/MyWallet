import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import CreateWallet from '../screens/CreateWallet';
import ImportWallet from '../screens/ImportWallet';
import WalletDashboard from '../screens/WalletDashboard';
import SendToken from '../screens/SendToken';
import ConnectWallet from '../screens/ConnectWallet';

const Stack = createStackNavigator(); // Create Stack Navigator

const AppStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="CreateWallet">
        <Stack.Screen name="CreateWallet" component={CreateWallet} />
        <Stack.Screen name="ImportWallet" component={ImportWallet} />
        <Stack.Screen name="WalletDashboard" component={WalletDashboard} />
        <Stack.Screen name="SendToken" component={SendToken} />
        <Stack.Screen name="ConnectWallet" component={ConnectWallet} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppStack;
