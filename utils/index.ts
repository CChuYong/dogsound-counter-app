import messaging from '@react-native-firebase/messaging';

export function toFormattedNumber(number: number) {
  return number
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    .replace('-', '');
}

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
}
