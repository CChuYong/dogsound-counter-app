import React, {useEffect, useState} from 'react';
import {
  Alert,
  Appearance,
  Keyboard,
  KeyboardAvoidingView,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Login = ({route, navigation}) => {
  const {width, height, API_HOSTNAME} = route.params;

  const [isDarkMode, setDarkMode] = useState(useColorScheme() === 'dark');
  useEffect(() => {
    Appearance.addChangeListener(({colorScheme}) => {
      setDarkMode(colorScheme === 'dark');
    });
    (async () => {
      const before = await SecureStore.getItemAsync('username');
      if (before) {
        await messaging().unsubscribeFromTopic(before);
        await SecureStore.deleteItemAsync('targetName');
        await AsyncStorage.removeItem('lastPrice');
        await AsyncStorage.removeItem('lastElements');
      }
    })();
  });
  const backgroundStyle = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#ffffff',
    },
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const doLogin = async () => {
    try {
      const data = await (
        await axios.post(`${API_HOSTNAME}/auth/login`, {
          username,
          password,
        })
      ).data;

      if (data.succeed) {
        await SecureStore.setItemAsync('username', username);
        await SecureStore.setItemAsync('token', data.message);
        navigation.push('Home');
      } else {
        Alert.alert(data.message);
      }
    } catch (err: any) {
      Alert.alert(err.message);
    }
  };

  useEffect(() => {
    navigation.addListener('beforeRemove', e => {
      e.preventDefault();
    });
  });
  return (
    <SafeAreaView style={backgroundStyle.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          behavior={'padding'}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              height: (height / 5) * 2,
              width: width,
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontSize: 50,
                fontWeight: 'bold',
                textAlign: 'center',
              }}>
              🐶
            </Text>
            <Text
              style={{
                fontSize: 30,
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#374151',
              }}>
              개소리 카운터
            </Text>
          </View>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              width: width,
              flex: 1,
              flexGrow: 1,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}>
            <View>
              <TextInput
                style={{
                  height: 49,
                  width: 90 * (width / 100),
                  paddingVertical: 14,
                  paddingHorizontal: 12,
                  backgroundColor: '#F9FAFB',
                  borderColor: '#E5E7EB',
                  borderWidth: 1,
                  borderRadius: 10,
                  marginBottom: 15,
                }}
                onChangeText={text => setUsername(text)}
                placeholder="Username"
              />
              <TextInput
                style={{
                  height: 49,
                  width: 90 * (width / 100),
                  paddingVertical: 14,
                  paddingHorizontal: 12,
                  backgroundColor: '#F9FAFB',
                  borderColor: '#E5E7EB',
                  borderWidth: 1,
                  borderRadius: 10,
                }}
                secureTextEntry={true}
                onChangeText={text => setPassword(text)}
                placeholder="Password"
              />
              <TouchableOpacity style={{marginTop: 10}} onPress={doLogin}>
                <View
                  style={{
                    width: 90 * (width / 100),
                    height: 56,
                    borderRadius: 13,
                    backgroundColor: '#10B981',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 10,
                  }}>
                  <Text style={{color: '#FFFFFF', fontSize: 20}}>로그인</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
    </SafeAreaView>
  );
};

export {Login};
