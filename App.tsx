import React, {
  type PropsWithChildren,
  Component,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {
  Alert,
  Appearance,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  NativeModules,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
  ViewStyle,
} from 'react-native';

import * as SecureStore from 'expo-secure-store';

import messaging from '@react-native-firebase/messaging';

import {Dimensions} from 'react-native';
import axios, {AxiosError} from 'axios';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import MainPage from './pages/MainPage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_HOSTNAME = 'http://114.205.21.171:9999';
const {width, height} = Dimensions.get('window');
const Stack = createNativeStackNavigator();
async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
}
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
        <Stack.Screen name="Login" component={Login} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

function toFormattedNumber(number: number) {
  return number
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    .replace('-', '');
}

const Login = ({navigation}) => {
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

const SubApp = ({navigation}) => {
  const [isDarkMode, setDarkMode] = useState(useColorScheme() === 'dark');
  const [refreshing, setRefreshing] = useState(false);
  const [content, setContent] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  useEffect(() => {
    SecureStore.getItemAsync('username').then(username => {
      if (username) {
        messaging().subscribeToTopic(username);
      }
    });

    // messaging()
    //   .getToken()
    //   .then(token => {
    //     Alert.alert(token);
    //     console.log(token);
    //   });
    messaging().onMessage(async () => {
      updatePrice();
      updateElements();
    });

    //return unsubscribe;
  }, []);
  const checkValiditiy = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        return true;
      }
      navigation.navigate('Login');
    } catch (err) {
      Alert.alert(err.toString());
      navigation.navigate('Login');
    }
    return false;
  };
  const [target, setTarget] = useState('');
  const loadDefaultContext = async () => {
    const token = await SecureStore.getItemAsync('targetName');
    if (token) {
      setTarget(token);
    }
  };
  const onPress = async () => {
    //Alert.alert('aa');
    if (content.length < 2) {
      Alert.alert('메시지를 입력해주세요');
      return;
    }
    try {
      const data = await axios.post(`${API_HOSTNAME}/data/`, {
        target: target,
        content: content,
      });
      setContent('');
      Alert.alert(data.data.message);
      if (data.data.succeed) {
        updateData();
      }
      //console.log('aa');
    } catch (err: any) {
      Alert.alert(err.toString());
    }
  };
  const backgroundStyle = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#ffffff',
    },
  });

  const updatePrice = async () => {
    const valid = await checkValiditiy();
    if (valid) {
      const lastPrice = await AsyncStorage.getItem('lastPrice');
      if (lastPrice) {
        setToPay(parseInt(lastPrice, 10));
      }
      try {
        const data = await axios.get(`${API_HOSTNAME}/data/toPay`);
        AsyncStorage.setItem('lastPrice', data.data.message.toString());
        setToPay(parseInt(data.data.message, 10));
      } catch (err) {}
    }
  };

  const updateElements = async () => {
    const valid = await checkValiditiy();
    if (valid) {
      const lastElements = await AsyncStorage.getItem('lastElements');
      const elementArr = [];
      let lastIndex = -1;
      if (lastElements) {
        elementArr.push(...JSON.parse(lastElements));
        lastIndex = elementArr[0].id || -1;
      }
      try {
        const elems = await axios.get(`${API_HOSTNAME}/data/${lastIndex}`);
        elementArr.unshift(...elems.data);
        AsyncStorage.setItem('lastElements', JSON.stringify(elementArr));
      } catch (err) {}

      setElements(
        elementArr.map(elem => {
          return (
            <View
              style={{
                width: 90 * (width / 100),
                marginBottom: 20,
                paddingBottom: 10,
                backgroundColor: '#F9FAFB',
                borderRadius: 20,
              }}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'column',
                  width: 90 * (width / 100),
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: 90 * (width / 100),
                    paddingTop: 30,
                    paddingHorizontal: 30,
                    paddingBottom: 10,
                  }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: 'bold',
                      color: '#4B5563',
                    }}>
                    {`${elem.speaker}`}
                  </Text>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: '600',
                      color: '#6B7280',
                      flexShrink: 1,
                      width: 50 * (width / 100),
                      textAlign: 'right',
                    }}>
                    {`${elem.content}`}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    width: 90 * (width / 100),
                    paddingRight: 30,
                    paddingBottom: 10,
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                  }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: 'bold',
                      color: '#9CA3AF',
                    }}>
                    {`${elem.price}원`}
                  </Text>
                </View>
              </View>
            </View>
          );
        }),
      );
    }
  };

  const updateData = useCallback(() => {
    setRefreshing(true);
    updateElements()
      .then(updatePrice)
      .then(() => setRefreshing(false));
  }, []);

  const [elements, setElements] = useState<Array<Element>>([]);
  const [toPay, setToPay] = useState(0);
  // const [statusBarHeight, setStatusBarHeight] = useState(0);
  useEffect(() => {
    Appearance.addChangeListener(({colorScheme}) => {
      setDarkMode(colorScheme === 'dark');
    });
  });

  useEffect(() => {
    loadDefaultContext();
    updatePrice();
    updateElements();
  }, []);

  const styles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 22,
    },
    modalView: {
      margin: 20,
      backgroundColor: '#FFFFFF',
      display: 'flex',
      borderRadius: 15,
      padding: 35,
      paddingBottom: 20,
      width: width * 0.8,
      alignItems: 'flex-start',
      elevation: 5,
    },
    button: {
      padding: 10,
      elevation: 2,
      width: '100%',
      display: 'flex',
      alignItems: 'flex-end',
    },
    textStyle: {
      color: '#3B82F6',
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    modalText: {
      marginBottom: 0,
      textAlign: 'left',
      color: '#4B5563',
      paddingBottom: 20,
      fontWeight: 'bold',
      fontSize: 20,
    },
  });
  const [temporaryTarget, setTemporaryTarget] = useState('');
  return (
    <SafeAreaView
      style={{
        ...backgroundStyle.container,
      }}>
      <View
        style={{
          width: width,
          height: height,
          backgroundColor: '#000000',
          opacity: 0.7,
          position: 'absolute',
          zIndex: 100,
          display: modalVisible ? 'flex' : 'none',
        }}
      />
      <KeyboardAvoidingView
        behavior={'padding'}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexGrow: 1,
        }}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>대상 닉네임을 입력하세요</Text>
              <TextInput
                style={{
                  height: 56,
                  width: '100%',
                  backgroundColor: '#F9FAFB',
                  padding: 20,
                  borderRadius: 13,
                  marginBottom: 10,
                  fontSize: 18,
                  color: '#4B5563',
                  fontWeight: 'bold',
                }}
                defaultValue={target}
                onChangeText={setTemporaryTarget}
              />
              <Pressable
                style={[styles.button]}
                onPress={() => {
                  setModalVisible(!modalVisible);
                  if (temporaryTarget.length > 2) {
                    setTarget(temporaryTarget);
                    SecureStore.setItemAsync('targetName', temporaryTarget);
                  }
                }}>
                <Text style={styles.textStyle}>설정하기</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <View
          style={{
            width: width,
            height: 18 * (height / 100),
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            margin: 20,
          }}>
          <View
            style={{flex: 1, flexDirection: 'column', alignItems: 'center'}}>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: width * 0.8,
              }}>
              <TouchableOpacity
                onPress={() => {
                  AsyncStorage.removeItem('lastElements').then(updateElements);
                }}>
                <Text
                  style={{color: '#374151', fontSize: 18, fontWeight: 'bold'}}>
                  개소리 카운터
                </Text>
              </TouchableOpacity>

              <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                }}>
                <TouchableOpacity
                  onPress={() => {
                    (async () => {
                      await SecureStore.deleteItemAsync('token');
                      await checkValiditiy();
                    })();
                  }}>
                  <Text
                    style={{
                      color: '#10B981',
                      fontSize: 15,
                      paddingBottom: 5,
                      fontWeight: 'bold',
                    }}>
                    로그아웃
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                  <Text
                    style={{
                      color: '#D1D5DB',
                      fontSize: 15,
                      fontWeight: 'bold',
                    }}>
                    대상 설정하기
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View
              style={{
                width: width * 0.8,
                marginTop: 30,
              }}>
              <View style={{display: 'flex', flexDirection: 'column'}}>
                <Text
                  style={{
                    fontSize: 20,
                    color: '#9CA3AF',
                    fontWeight: 'bold',
                    marginBottom: 5,
                  }}>
                  현재 잔고 ({toPay < 0 ? '내가 지는중' : '내가 이기는중'})
                </Text>
                <Text
                  style={{fontSize: 40, color: '#374151', fontWeight: 'bold'}}>
                  {toFormattedNumber(toPay)}원
                </Text>
              </View>
            </View>
          </View>
        </View>

        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            flexGrow: 1,
            width: 90 * (width / 100),
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={updateData} />
          }>
          {elements}
        </ScrollView>
        <View
          style={{
            width: 90 * (width / 100),
            height: 55,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 10,
            marginBottom: 5,
          }}>
          <TextInput
            style={{
              height: 55,
              width: 70 * (width / 100),
              backgroundColor: '#F9FAFB',
              borderColor: '#E5E7EB',
              borderWidth: 1,
              borderRadius: 13,
              padding: 10,
              fontWeight: 'bold',
              color: '#4B5563',
            }}
            value={content}
            onChangeText={setContent}
          />
          <TouchableOpacity onPress={onPress}>
            <View
              style={{
                height: '100%',
                borderRadius: 13,
                width: 20 * (width / 100),
                backgroundColor: '#10B981',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 10,

                marginLeft: 10,
                position: 'relative',
              }}>
              <Text
                style={{color: '#FFFFFF', fontSize: 20, fontWeight: 'bold'}}>
                개소리
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
    </SafeAreaView>
  );
};
export default App;
