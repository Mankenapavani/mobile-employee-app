
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Decide how notifications appear while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Ask the user for notification permission.
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const current = await Notifications.getPermissionsAsync();

  let permission = current;

  if (!current.granted) {
    permission = await Notifications.requestPermissionsAsync();
  }

  return (
    permission.granted ||
    permission.ios?.status ===
      Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

// Schedule a local test notification.
export async function scheduleTestNotification(): Promise<void> {
  if (Platform.OS === 'web') {
    throw new Error(
      'Local notifications must be tested on a native device.',
    );
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Employee Hub',
      body: 'Your notification is working!',
      data: { screen: 'Home' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });
}