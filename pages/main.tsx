import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  Appearance,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {toFormattedNumber} from '../utils';

const {width, height} = Dimensions.get('window');

const SubApp = ({route, navigation}) => {
  const {width, height, API_HOSTNAME} = route.params;
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
    } catch (err: Error) {
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
      backgroundColor: isDarkMode ? '#111111' : '#ffffff',
    },
  });

  const elementStyle = StyleSheet.create({
    elemStyle: {
      width: 90 * (width / 100),
      marginBottom: 20,
      paddingBottom: 10,
      backgroundColor: isDarkMode ? '#D1D5DB' : '#F9FAFB',
      borderRadius: 20,
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
            <View style={elementStyle.elemStyle}>
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
                  style={{color: isDarkMode ? '#ffffff' : '#374151', fontSize: 18, fontWeight: 'bold'}}>
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
                    color: isDarkMode ? '#FAFAFA' : '#9CA3AF',
                    fontWeight: 'bold',
                    marginBottom: 5,
                  }}>
                  현재 잔고 ({toPay < 0 ? '내가 지는중' : '내가 이기는중'})
                </Text>
                <Text
                  style={{fontSize: 40, color: isDarkMode ? '#ffffff' : '#374151', fontWeight: 'bold'}}>
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
              backgroundColor: isDarkMode ? '#D1D5DB' : '#F9FAFB',
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

export {SubApp};
