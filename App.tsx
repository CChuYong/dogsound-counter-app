import React, {useEffect, useState} from 'react';
import {Appearance, Dimensions, useColorScheme} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import {requestUserPermission} from './utils';
import {SubApp} from './pages/main';
import {Login} from './pages/login';

const API_HOSTNAME = 'http://114.205.21.171:9999';
const {width, height} = Dimensions.get('window');
const Stack = createNativeStackNavigator();

const App = () => {
  const [isDarkMode, setDarkMode] = useState(useColorScheme() === 'dark');
  useEffect(() => {
    Appearance.addChangeListener(({colorScheme}) => {
      setDarkMode(colorScheme === 'dark');
    });
    requestUserPermission();
  });
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{headerShown: false, gestureEnabled: false}}>
        <Stack.Screen
          name="Home"
          component={SubApp}
          initialParams={{
            width: width,
            height: height,
            API_HOSTNAME: API_HOSTNAME,
            isDarkMode: isDarkMode,
          }}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          initialParams={{
            width: width,
            height: height,
            API_HOSTNAME: API_HOSTNAME,
            isDarkMode: isDarkMode,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
