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

const {StatusBarManager} = NativeModules;
import {
  Colors,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import * as SecureStore from 'expo-secure-store';

import {Dimensions} from 'react-native';
import axios, {AxiosError} from 'axios';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';

const API_HOSTNAME = 'http://114.205.21.171:9999';

const {width, height} = Dimensions.get('window');
const Section: React.FC<
  PropsWithChildren<{
    title: string;
  }>
> = ({children, title}) => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});
const Stack = createNativeStackNavigator();
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{headerShown: false, gestureEnabled: false}}>
        <Stack.Screen name="Home" component={SubApp} />
        <Stack.Screen name="Login" component={Login} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

function toFormattedNumber(number: number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const Login = ({navigation}) => {
  const [isDarkMode, setDarkMode] = useState(useColorScheme() === 'dark');
  useEffect(() => {
    Appearance.addChangeListener(({colorScheme}) => {
      setDarkMode(colorScheme === 'dark');
    });
  });
  const backgroundStyle = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#ffffff' : '#111111',
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
                placeholder="Username"
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
    },
  });

  const updatePrice = async () => {
    const valid = await checkValiditiy();
    if (valid) {
      try {
        const data = await axios.get(`${API_HOSTNAME}/data/toPay`);
        setToPay(parseInt(data.data.message, 10));
      } catch (err: AxiosError) {
        Alert.alert(err.cause.message);
      }
    }
  };

  const updateElements = async () => {
    const valid = await checkValiditiy();
    if (valid) {
      const elems = await axios.get(`${API_HOSTNAME}/data`);
      setElements(
        elems.data.map((elem: any) => {
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
                  flexDirection: 'row',
                  width: 90 * (width / 100),
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    padding: 30,
                  }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: 'bold',
                    }}>
                    {`${elem.speaker}`}
                  </Text>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: 'bold',
                    }}>
                    {`${elem.content}`}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                  }}>
                  {`${elem.price}`}
                </Text>
                <Text>({elem.speakAt})</Text>
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

  const [elements, setElements] = useState([]);
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
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 35,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    button: {
      borderRadius: 20,
      padding: 10,
      elevation: 2,
    },
    buttonOpen: {
      backgroundColor: '#FFE082',
    },
    buttonClose: {
      backgroundColor: '#FFE082',
    },
    textStyle: {
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    modalText: {
      marginBottom: 15,
      textAlign: 'center',
    },
  });
  const [temporaryTarget, setTemporaryTarget] = useState('');
  return (
    <SafeAreaView
      style={{
        ...backgroundStyle.container,
        backgroundColor: isDarkMode ? Colors.black : Colors.white,
      }}>
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
                  height: 45,
                  width: 50 * (width / 100),
                  backgroundColor: '#ffffff',
                  borderWidth: 1,
                  borderRadius: 13,
                  marginBottom: 10,
                }}
                defaultValue={target}
                onChangeText={setTemporaryTarget}
              />
              <Pressable
                style={[styles.button, styles.buttonClose]}
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
            width: 90 * (width / 100),
            height: 20 * (height / 100),
            borderRadius: 13,
            backgroundColor: '#FFB300',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 20,
            marginBottom: 20,
          }}>
          <View
            style={{flex: 1, flexDirection: 'column', alignItems: 'center'}}>
            <Text style={{color: '#FFFFFF', fontWeight: '600', fontSize: 25}}>
              당신이 내셔야 할 금액은...
            </Text>
            <Text style={{color: '#FFFFFF', fontWeight: '800', fontSize: 30}}>
              {toFormattedNumber(toPay)}원
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              onPress={() => {
                (async () => {
                  await SecureStore.deleteItemAsync('token');
                  await checkValiditiy();
                })();
              }}>
              <View
                style={{
                  width: 40 * (width / 100),
                  height: 5 * (height / 100),
                  borderRadius: 13,
                  backgroundColor: '#FFE082',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{color: '#ffffff', fontSize: 20}}>
                  로그아웃하기
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <View
                style={{
                  width: 40 * (width / 100),
                  height: 5 * (height / 100),
                  borderRadius: 13,
                  backgroundColor: '#FFE082',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginLeft: 10,
                }}>
                <Text style={{color: '#ffffff', fontSize: 20}}>
                  대상 설정하기
                </Text>
              </View>
            </TouchableOpacity>
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
            height: 5 * (height / 100),
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 10,
            marginBottom: 5,
          }}>
          <TextInput
            style={{
              height: 45,
              width: 75 * (width / 100),
              backgroundColor: '#ffffff',
              borderWidth: 1,
              borderRadius: 13,
            }}
            value={content}
            onChangeText={setContent}
          />
          <TouchableOpacity onPress={onPress}>
            <View
              style={{
                height: '100%',
                borderRadius: 13,
                backgroundColor: '#FFB300',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 10,
                marginLeft: 10,
                position: 'relative',
              }}>
              <Text style={{color: '#FFFFFF'}}>개소리</Text>
            </View>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
    </SafeAreaView>
  );
};
export default App;
